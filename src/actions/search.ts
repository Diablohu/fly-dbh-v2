import { defineAction, ActionError } from "astro:actions";
import { z } from "astro:schema";
import type { SanityDocument } from "@sanity/client";

import { type VideoItemType, type VideoListPageTypesType } from "@/types";
import { extraAviationKnowledgeTitle } from "@/global";

import { fetch } from "@/services/sanity";
import { transformImagePath } from "@/utils/sanity-helpers";
import getVideoListPageTypeInfo from "@/utils/get-video-list-page-type-info";
import actionErrorHandler from "./_error-handler";
import { E50000 } from "@/constants/error-codes";

// ============================================================================

const defaultLength = 10;
const getKeywords = (keyword: string, split = false) => [
    ...new Set([
        ...(split ? keyword.trim().toLowerCase().split(/\s+/g) : [keyword]),
        keyword.replace(/([a-z])([0-9])/gi, "$1-$2"),
        keyword.replace(/^[a-z]{1}([0-9a-z]{3})/gi, "$1"),
        keyword.replace(/[^\s^0-9^a-z]+([0-9a-z])/gi, "$1"),
    ]),
];
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
};

const keywordRegex = {
    tutorial: /教学|教程|攻略|上手|指南/,
    review: /评测|测评|试飞|体验|简评/,
};

function getValues(keyword: string) {
    const isTutorial = keywordRegex.tutorial.test(keyword);
    const isReview = keywordRegex.review.test(keyword);

    if (isTutorial) keyword = keyword.replace(keywordRegex.tutorial, "");
    if (isReview) keyword = keyword.replace(keywordRegex.review, "");
    keyword = keyword.trim();

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

    const groqVideos = `
*[_type == "video" && ${getKeywordFilter("title")}${getKeywordFilterTags()}]
${projection}
| order( release desc )`;

    return {
        keywords,
        getKeywordFilter,
        groqVideos,
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
            try {
                const { getKeywordFilter, groqVideos } = getValues(keyword);
                const res = (await fetch(
                    `{
'list': ${groqVideos}[${from}...${from + length}],
'total' : count(${groqVideos}),` +
                        (from === 0
                            ? `
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
    [0...10],`
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
                                }
                            );

                            (res as unknown as ResultType).page =
                                Math.floor(from / length) + 1;

                            return res;
                        },
                    }
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
                    const matched:
                        | Required<ResultType>["aircraftFamilies"][0]
                        | Required<ResultType>["aircraftOnboardDevices"][0]
                        | undefined =
                        res?.aircraftFamilies?.find((item) =>
                            keywords.find((kw) => {
                                return (
                                    kw === item.name.toLowerCase() ||
                                    item.name
                                        .split(/\s+/g)
                                        .some((n) => kw === n.toLowerCase()) ||
                                    item.aircrafts?.some(
                                        (aircraft) =>
                                            kw ===
                                                aircraft.name.toLowerCase() ||
                                            kw ===
                                                aircraft.icao_code.toLowerCase()
                                    )
                                );
                            })
                        ) ??
                        res?.aircraftOnboardDevices?.find((item) =>
                            keywords.find((kw) => {
                                return kw === item.name.toLowerCase();
                            })
                        );

                    if (matched) {
                        function getGorq(ref: string) {
                            return `
*[_type=="video" && "tutorial" in tags[]->slug.current && references(${ref})]
    ${projection}
    | order(release desc)`;
                        }
                        /** 匹配项目的类型 */
                        const type: VideoListPageTypesType =
                            "aircrafts" in matched
                                ? "aircraftFamily"
                                : "aircraftOnboardDevice";
                        /** 额外查询的 GROQ */
                        const toQuery = [
                            {
                                name: "教程攻略",
                                query: getGorq(`"${matched._id}"`),
                            },
                        ];
                        // 如果项目有 `机载设备`，添加到查询
                        if ("onboard_devices" in matched) {
                            (
                                matched.onboard_devices as {
                                    _id: string;
                                    name: string;
                                    maker: string;
                                }[]
                            )?.forEach(({ _id, maker, name }) => {
                                toQuery.push({
                                    name: `机载设备 (${maker} ${name}) 教学`,
                                    query: getGorq(`"${_id}"`),
                                });
                            });
                        }
                        // 如果项目有 `标签`，添加到查询
                        if (
                            "tagsId" in matched &&
                            Array.isArray(matched.tagsId) &&
                            matched.tagsId.length > 0
                        ) {
                            toQuery.push({
                                name: extraAviationKnowledgeTitle,
                                query: getGorq(
                                    `[${matched.tagsId.map((_id) => `"${_id}"`).join(",")}]`
                                ),
                            });
                        }
                        // 开始查询
                        res.tutorialsForMatchedAircraftOrDevice = {
                            type,
                            ...matched,
                            list: (await fetch(
                                "{" +
                                    toQuery
                                        .map(
                                            ({ name, query }) =>
                                                `'${name}' : ${query},`
                                        )
                                        .join("\n") +
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

                                        const list =
                                            res as unknown as Required<ResultType>["tutorialsForMatchedAircraftOrDevice"]["list"];

                                        // 最终处理获取的列表
                                        for (const [
                                            type,
                                            posts,
                                        ] of Object.entries(list)) {
                                            // 如果该类别没有数据，过滤掉
                                            if (
                                                !Array.isArray(posts) ||
                                                !posts.length
                                            )
                                                delete list[type];

                                            // 如果不是 `航空知识` 类别
                                            // 过滤掉在 `航空知识` 类别中出现的视频
                                            if (
                                                type !==
                                                extraAviationKnowledgeTitle
                                            ) {
                                                list[type] = posts.filter(
                                                    (post) =>
                                                        list[
                                                            extraAviationKnowledgeTitle
                                                        ].every(
                                                            ({ _id }) =>
                                                                _id !== post._id
                                                        )
                                                );
                                            }
                                        }

                                        // 转化缩略图地址
                                        Object.values(list).forEach((list) => {
                                            list.forEach((post) => {
                                                post.cover = transformImagePath(
                                                    post.cover
                                                );
                                            });
                                        });

                                        return res;
                                    },
                                }
                            )) as unknown as Required<ResultType>["tutorialsForMatchedAircraftOrDevice"]["list"],
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
