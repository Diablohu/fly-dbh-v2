import { defineAction, ActionError } from "astro:actions";
import { z } from "astro/zod";
import type { SanityDocument } from "@sanity/client";

import {
    type VideoItemType,
    type VideoListPageTypesType,
    type AerodromeCodeType,
    type ChallengeItemType,
} from "@/types";
import { commonAircraftNameSuffix } from "@/global";

import { fetch } from "@/services/sanity";
import fetchAllTutorialVideosForSubject from "@/services/queries/fetch-all-tutorial-videos-for-subject";
import { transformImagePath } from "@/services/sanity-helpers";
import getVideoListPageTypeInfo from "@/utils/get-video-list-page-type-info";
import actionErrorHandler from "./_error-handler";
import {
    getGroqFilterBase as getChallengesGroqFilterBase,
    getGroqQueryChallengeList,
} from "./challenge";
import { E50000 } from "@/constants/error-codes";

// ============================================================================

const defaultLength = 10;
const getKeywords = (keyword: string, split = false) =>
    [
        ...new Set([
            ...(split ? keyword.trim().toLowerCase().split(/\s+/g) : [keyword]),

            // 变换机型名称
            keyword.replace(/([a-z])([0-9])/gi, "$1-$2"),
            keyword.replace(/^[a-z]{1}([0-9a-z]{3})/gi, "$1"),
            keyword.replace(/[^\s^0-9^a-z]+([0-9a-z])/gi, "$1"),
            keyword.replace(
                new RegExp(
                    `(\\d+)(${commonAircraftNameSuffix.join("|")})`,
                    "gi",
                ),
                "$1 $2",
            ),

            // 处理 Unicode 错误：变换 [X]U[数字] -> [X]U0[数字]
            keyword.replace(/(\w)u([0-9])([^0-9]|$)/gi, "$1u0$2$3"),

            // 如果关键字包含“机场”二字，移除
            keyword.replace(/机场/gi, ""),
        ]),
    ].filter((seg) => Boolean(seg) && !/^\s+$/.test(seg));
const projection = `{
    _id,
    "slug": slug.current,
    title,
    'tags': tags[]->{
        _id,
        "slug": slug.current,
        "name": title
    },
    release,
    description,
    links,
    "cover": cover.asset->path,
}`;

// ============================================================================

type ReturnVideoItemType = Partial<VideoItemType> &
    Pick<
        VideoItemType,
        "_id" | "title" | "release" | "cover" | "tags" | "links"
    >;
type ResultType = {
    list: SanityDocument<ReturnVideoItemType>[];
    total: number;
    page: number;
    // categories: SanityDocument<{
    //     _id: string;
    //     slug?: string;
    //     title: string;
    //     tag_type: string;
    // }>[];
    aircraftFamilies?: SanityDocument<{
        _id: string;
        slug?: string;
        name: string;
        maker: string;
        aircrafts: { icao_code: string; name: string }[];
        tagsId?: string[];
        onboard_devices?: string[];
    }>[];
    aircraftOnboardDevices?: SanityDocument<{
        _id: string;
        slug?: string;
        name: string;
        maker: string;
        tagsId?: string[];
    }>[];

    tutorialsForMatchedAircraftOrDevice?: {
        type: VideoListPageTypesType;
        _id: string;
        slug?: string;
        name: string;
        maker: string;
        aircrafts?: { icao_code: string; name: string }[];
        list: {
            [type: string]: SanityDocument<ReturnVideoItemType>[];
        };
    };

    approachChallenges?: SanityDocument<ChallengeItemType>[];
};

const keywordRegex = {
    tutorial: /教学|教程|攻略|上手|指南/,
    review: /评测|测评|试飞|体验|简评/,
};

function getGroqAndFilters(keyword: string) {
    const isTutorial = keywordRegex.tutorial.test(keyword);
    const isReview = keywordRegex.review.test(keyword);

    if (isTutorial) keyword = keyword.replace(keywordRegex.tutorial, "");
    if (isReview) keyword = keyword.replace(keywordRegex.review, "");
    keyword = keyword.trim();

    /** 拆分后的关键字 */
    const keywords = getKeywords(keyword);
    const getKeywordFilter = (name: string) =>
        `(${keywords.map((keyword) => `${name} match "*${keyword}*"`).join(" || ")})`;
    const getKeywordFilterTags = () => {
        const checkTags = [
            isTutorial ? "tutorial" : null,
            isReview ? "review" : null,
        ].filter(Boolean) as string[];

        if (!checkTags.length) return "";
        return ` && (${checkTags.map((slug) => `"${slug}" in tags[]->slug.current`).join(" || ")})`;
    };

    /** GROQ: 查询视频内容 */
    const groqVideos = `
*[_type == "video" && ${getKeywordFilter("title")}${getKeywordFilterTags()}]
${projection}
| order( release desc )`;

    /** GROQ: 查询固定翼挑战内容 */
    const groqFilterChallenges = (() => {
        // 以所有关键字来查询机场名称和机场位置
        const filters: string[] = keywords
            .map((kw) => {
                return [
                    `aerodrome->name match "*${kw}*"`,
                    `aerodrome->location[] match "*${kw}*"`,
                    `aerodrome->keywords[] match "*${kw}*"`,
                ];
            })
            .flat();

        /**
         * 机场代码关键字
         *  - 以仅包含字母、数字和横线的关键字来查询机场代码
         */
        const codeKeywords = keywords.filter((kw) => /^[a-z0-9-]+$/i.test(kw));
        if (codeKeywords.length) {
            const types: AerodromeCodeType[] = [
                "icao",
                "iata",
                "faa",
                "designator",
            ];
            types.forEach((t) => {
                filters.push(
                    `lower(aerodrome->${t}) in [${codeKeywords.map((kw) => `lower('${kw}')`)}]`,
                );
            });
        }

        if (filters.length)
            return (
                "*[" +
                getChallengesGroqFilterBase({ onlyFullArticle: false }) +
                "&&(" +
                filters.join("||") +
                ")]"
            );
        return "";
    })();

    return {
        keywords,
        getKeywordFilter,
        groqVideos,
        groqFilterChallenges,
    };
}

// ============================================================================

const actions = {
    query: defineAction({
        input: z.object({
            keyword: z.string(),
            from: z.number().optional(),
            length: z.number().optional(),
        }),
        handler: async ({ keyword, from = 0, length = defaultLength }) => {
            if (!keyword) {
                const err = new ActionError({
                    message: E50000,
                    code: "NOT_FOUND",
                });
                err.cause = { reason: "no keyword" };
                throw err;
            }
            keyword = keyword
                .trim()
                .replace(/\\/g, "\\\\")
                .replace(/\"/g, '\\"');
            // console.log({ keyword });
            try {
                const { getKeywordFilter, groqVideos, groqFilterChallenges } =
                    getGroqAndFilters(keyword);
                const res = (await fetch(
                    `{
'list': ${groqVideos}[${from}...${from + length}],
'total' : count(${groqVideos}),` +
                        (from === 0
                            ? // 第一页：连带查询其他内容
                              `
'aircraftFamilies': *[
    _type == "${getVideoListPageTypeInfo("aircraftFamily").type}" && (
        ${getKeywordFilter("name")} ||
        ${getKeywordFilter("aircrafts[].name")} ||
        aircrafts[].icao_code match "*${keyword}*"
    )]
    | order( maker->icao_code asc, name asc )
    {
        _id,
        "slug": slug.current,
        name,
        'maker': maker->name_zh_cn,
        'tagsId': tags[]->_id,
        'onboard_devices': onboard_devices[]->{
            'maker': maker->name_zh_cn,
            name,
            _id,
        },
        aircrafts[]{icao_code, name},
    }
    [0...10],

'aircraftOnboardDevices': *[
    _type == "${getVideoListPageTypeInfo("aircraftOnboardDevice").type}" && (
        ${getKeywordFilter("name")}
    )]
    | order( maker->icao_code asc, name asc )
    {
        _id,
        "slug": slug.current,
        name,
        'tagsId': tags[]->_id,
        'maker': maker->name_zh_cn,
    }
    [0...10],

'approachChallenges': ${getGroqQueryChallengeList({
                                  filter: groqFilterChallenges,
                                  sort: "difficulty",
                                  onlyFullArticle: false,
                              })},`
                            : "") +
                        "}",
                    {
                        transform: (res, queryString) => {
                            if (!res) {
                                const err = new ActionError({
                                    message: E50000,
                                    code: "NOT_FOUND",
                                });
                                err.cause = { GROQ: queryString };
                                throw err;
                            }
                            // console.log(queryString)

                            (res as unknown as ResultType).list.forEach(
                                (post) => {
                                    post.cover = transformImagePath(post.cover);
                                },
                            );

                            (res as unknown as ResultType).page =
                                Math.floor(from / length) + 1;

                            return res;
                        },
                    },
                )) as unknown as ResultType;

                // 如果有匹配 `机型系列` 或 `航电设备`
                // 确认是否有精准匹配
                // 如果有：额外查询所有相关教学视频
                if (
                    res?.aircraftFamilies?.length ||
                    res?.aircraftOnboardDevices?.length
                ) {
                    const keywords = getKeywords(keyword, true);

                    /** 匹配的 `机型系列` 或 `航电设备` */
                    const matches:
                        | Required<ResultType>["aircraftFamilies"]
                        | Required<ResultType>["aircraftOnboardDevices"] = [
                        ...(res?.aircraftFamilies?.filter((item) =>
                            keywords.find((kw) => {
                                return (
                                    kw === item.name.toLowerCase() ||
                                    item.name
                                        .split(/\s+/g)
                                        .some((n) => kw === n.toLowerCase()) ||
                                    (new RegExp(
                                        `^\\d+(${commonAircraftNameSuffix.map((s) => ` ${s}`).join("|")}|$)`,
                                        "i",
                                    ).test(kw) &&
                                        new RegExp(
                                            `^[a-z]${kw}( |-|$)`,
                                            "i",
                                        ).test(item.name)) ||
                                    item.aircrafts?.some(
                                        (aircraft) =>
                                            kw ===
                                                aircraft.name.toLowerCase() ||
                                            kw ===
                                                aircraft.icao_code.toLowerCase(),
                                    )
                                );
                            }),
                        ) || []),
                        ...(res?.aircraftOnboardDevices?.filter((item) =>
                            keywords.find((kw) => {
                                return (
                                    kw === item.name.toLowerCase() ||
                                    (/^\d+$/i.test(kw) &&
                                        new RegExp(
                                            `^[a-z]${kw}( |-|$)`,
                                            "i",
                                        ).test(item.name))
                                );
                            }),
                        ) || []),
                    ];

                    // console.log(
                    //     keywords,
                    //     res?.aircraftFamilies,
                    //     res.aircraftOnboardDevices,
                    //     matches
                    // );
                    if (Array.isArray(matches) && matches.length === 1) {
                        const matched = matches[0];
                        /** 匹配项目的类型 */
                        const type: VideoListPageTypesType =
                            "aircrafts" in matched
                                ? "aircraftFamily"
                                : "aircraftOnboardDevice";
                        // 开始查询
                        res.tutorialsForMatchedAircraftOrDevice = {
                            type,
                            ...matched,
                            list: await fetchAllTutorialVideosForSubject<ReturnVideoItemType>(
                                {
                                    _id: matched._id,
                                    type,
                                    onboardDevices:
                                        "onboard_devices" in matched
                                            ? (
                                                  matched.onboard_devices as {
                                                      _id: string;
                                                      name: string;
                                                      maker: string;
                                                  }[]
                                              )?.map(
                                                  ({ _id, maker, name }) => ({
                                                      _id,
                                                      label: `${maker} ${name}`,
                                                  }),
                                              )
                                            : undefined,
                                    aircraftTags: matched.tagsId,
                                },
                                { projection },
                            ),
                        };
                    }
                }

                return res;
            } catch (err) {
                actionErrorHandler(err);
            }
        },
    }),
};

export default actions;

/*
'categories': *[_type == "tag" && title match "*${keyword}*"]
    | order( sort asc )
    {
        _id,
        "slug": slug.current,
        title,
        tag_type,
    }
    [0...5],
*/
