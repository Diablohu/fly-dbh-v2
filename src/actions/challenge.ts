import type { SanityDocument } from "@sanity/client";
import { z } from "astro/zod";
import { defineAction, ActionError } from "astro:actions";
import { fetch } from "@/services/sanity";
import {
    transformImagePath,
    stringReplaceImagePath,
} from "@/services/sanity-helpers";
import actionErrorHandler from "./_error-handler";
import { E60000, E60001, E60002 } from "@/constants/error-codes";
import { EXTREME_AIRPORT } from "@/constants/video-tags";
import {
    type ChallengeListItemType,
    type ChallengeItemType,
    type ChallengeDifficultyType,
    type ChallengeListQueryConditionType,
} from "@/types";
import getCmsIdOrSlug from "@/utils/get-cms-id-or-slug";
import getGroqFilterVideo from "@/utils/groq/get-filter-video";

// ============================================================================

export type ChallengeListResponseDataType = {
    list: ChallengeItemType[];
    total: number;
    page: number;
};

export const orderList = `max_allowed_aircraft_category asc, difficulty desc, aerodrome.icao asc, aerodrome.iata asc, aerodrome.faa, aerodrome.designator asc`;

export const getGroqProjection = (
    purpose:
        | "details"
        | "list-item"
        | "random-item"
        | {
              aircraftsInfo?: boolean;
              hazards?: boolean;
              aerodromeDetails?: boolean;
              route?: boolean;
              briefing?: boolean;
              otherChallenges?: boolean;
              videos?: boolean;
          },
    { bracket = false } = {},
) => {
    const {
        aircraftsInfo = false,
        hazards = false,
        aerodromeDetails = false,
        route = false,
        briefing = false,
        otherChallenges = false,
        videos = false,
    } = purpose === "details"
        ? {
              aircraftsInfo: true,
              hazards: true,
              aerodromeDetails: true,
              route: true,
              briefing: true,
              otherChallenges: true,
              videos: true,
          }
        : purpose === "list-item"
          ? {
                aircraftsInfo: true,
            }
          : purpose === "random-item"
            ? {
                  aircraftsInfo: true,
                  hazards: true,
              }
            : purpose;
    return (
        `${bracket ? "{" : ""}
_id,
_createdAt,
_updatedAt,
'slug': slug.current,
airac_cyle,
name,
type,
difficulty,` +
        [
            `'aerodrome': aerodrome->{
    _id,
    'slug': slug.current,
    name,
    is_closed,
    icao,
    is_fake_icao,
    iata,
    faa,
    designator,
    location,
    ${
        aerodromeDetails
            ? `'runways': runways[]{
        identifier,
        bearing,
        elevation,
        length,
        width,
        slope,
    },
    'photo': photo.asset->path,
    photo_credit,
    photo_credit_url,
    'free_addons': free_addons[]{
        'platform': platform->name,
        type,
        msfs_package,
        url,
        extra,
    },
    'free_addons_scenery': free_addons_scenery[]{
        'platform': platform->name,
        type,
        msfs_package,
        url,
        extra,
    },`
            : ""
    }
}`,
            aerodromeDetails && "runways[]",
            aircraftsInfo && "max_allowed_aircraft_category",
            aircraftsInfo && "typical_aircraft_types",
            aircraftsInfo && "typical_aircrafts",
            hazards &&
                `
'hazards': hazards[]{
    ...hazard->{
        name,
        emoji,
        difficulty,
        comment,
    },
    extra_comment,
}|order(difficulty desc)`,
            route &&
                `
'route': {
    'origin': routeOrigin->{
        _id,
        'slug': slug.current,
        name,
        is_closed,
        icao,
        is_fake_icao,
        iata,
        faa,
        designator,
    },
    'sid': routeSID[]{
        rwy,
        sid,
    },
    'enroute': routeEnroute,
    'destination': routeDestination->{
        _id,
        'slug': slug.current,
        name,
        is_closed,
        icao,
        is_fake_icao,
        iata,
        faa,
        designator,
    },
    'star': routeSTAR[]{
        rwy,
        star,
    },
    'app': routeAPP,
    'distance': routeDistance,
    'cruise': routeCruise,
}`,
            briefing && "briefing",
            otherChallenges &&
                `
'other_challenges_this_aerodrome': *[${getGroqFilterBase({
                    onlyFullArticle: false,
                })} && aerodrome->_id == ^.aerodrome->_id && _id != ^._id]{
    _id,
    'slug': slug.current,
    name,
    difficulty,
    max_allowed_aircraft_category,
    typical_aircraft_types,
    airac_cyle,
} | order(${orderList})`,
            videos &&
                `
video_url_briefing,
'videos_this_aerodrome': ${getGroqFilterVideo(`references(^.aerodrome->_id)`)}{
    _id,
    'slug': slug.current,
    title,
    release,
    duration,
    'cover': cover.asset->path,
    'tags': tags[]->{
        _id,
        'slug': slug.current,
        "value": name,
        "name": title
    },
    links,
}`,
            bracket && "}",
        ]
            .filter(Boolean)
            .join(",")
    );
};

const projectionListItem = getGroqProjection("list-item");

export const getGroqFilterBase = ({
    onlyFullArticle = true,
}: Partial<Pick<ChallengeListQueryConditionType, "onlyFullArticle">> = {}) =>
    `_type == "approach_challenge"${
        // 查询完整文章时，添加条件：必须有 `airac_cyle` 字段
        onlyFullArticle === true
            ? "&& defined(airac_cyle)"
            : onlyFullArticle === "no-airac"
              ? "&& !defined(airac_cyle)"
              : ""
    }`;
export const getGroqFiltersChallengeList = ({
    // sort = "latest",
    difficulties = [],
    types = [],
    hazards = [],
    onlyFullArticle = true,
}: Partial<
    Pick<
        ChallengeListQueryConditionType,
        "sort" | "difficulties" | "types" | "hazards" | "onlyFullArticle"
    >
> = {}) =>
    `*[${
        getGroqFilterBase({ onlyFullArticle }) +
        // 筛选难度，方式：`OR`
        (Array.isArray(difficulties) && difficulties.length > 0
            ? `&& (${difficulties.map((difficulty) => `difficulty == ${Number(difficulty)}`).join(" || ")})`
            : "") +
        // 筛选机型，方式：`AND`
        (Array.isArray(types) && types.length > 0
            ? types.map((type) => `&& "${type}" in typical_aircraft_types`)
            : "") +
        // 筛选难点灾害，方式：`AND`
        (Array.isArray(hazards) && hazards.length > 0
            ? hazards
                  .map((hazard) => {
                      let amend: string[] | undefined = undefined;
                      /*
                        SPECIAL AMENDMENT
                        选择较低难度的灾害，自动带上对应的更高难度的灾害
                        这些自动带入的条件，采用“或”查询
                        */
                      if (
                          [
                              [
                                  "6234459e-393d-40ca-b89e-264549262502", // 较大坡度跑道
                                  "4bd67840-b34c-4f1e-80f6-98e695c64184", // 甚大坡度跑道
                                  "3004c572-edf8-4664-a121-e2b7f6abb212", // 极大坡度跑道
                              ],
                              [
                                  "4bd67840-b34c-4f1e-80f6-98e695c64184", // 甚大坡度跑道
                                  "3004c572-edf8-4664-a121-e2b7f6abb212", // 极大坡度跑道
                              ],
                              [
                                  "59fe3bd7-b1c8-433e-a8ba-2bb8c8336812", // 低空大坡度转向
                                  "a0bd153b-49bb-4796-888c-fac91e4aaab8", // 超低空大坡度转向
                              ],
                              [
                                  "cbca20c8-b49e-4199-9ccb-49191c741210", // 仪表程序有航向道偏移
                                  "26f19839-80c3-4590-9c18-a0faf8c2b6e4", // 仪表程序航向道偏移甚大
                              ],
                              [
                                  "ca424c39-1458-475b-b34f-ee2213392d74", // 短第五边
                                  "48491080-a1cc-430d-82a5-ff3ba43c6378", // 极短第五边
                              ],
                              [
                                  "a7b92c63-e75b-4a10-93c8-9667ef74a4da", // 短跑道
                                  "3be66f43-a39a-4baf-8269-bc6215d35221", // 极短跑道
                              ],
                              [
                                  "c3f6a338-87b9-4418-bee3-c7e8730e83a0", // 较大下滑角
                                  "65ab3041-e6c2-4a00-97ce-c387a0f91cc4", // 甚大下滑角
                              ],
                              [
                                  "25a51939-b0da-4839-b3ed-c741e46f428e", // 高原机场
                                  "7be03766-484a-489b-9da8-eb44658f9c31", // 高高原机场
                              ],
                              [
                                  "58d203b4-1b48-4282-892d-2afedffa6db8", // 地形风险
                                  "507b1ca5-e112-4f17-b566-4b2eeedcd728", // 地容错地形风险
                              ],
                          ].some((arr) => {
                              if (hazard === arr[0]) {
                                  amend = arr;
                                  return true;
                              }
                              return false;
                          }) &&
                          Array.isArray(amend)
                      ) {
                          return `&&(${(amend as string[])
                              ?.map(
                                  (hazardId) =>
                                      `"${hazardId}" in hazards[].hazard->_id`,
                              )
                              .join("||")})`;
                      }
                      return `&& "${hazard}" in hazards[].hazard->_id`;
                  })
                  .join("")
            : "")
    }]`;

export const getGroqQueryChallengeList = ({
    from = 0,
    length = 10,
    sort = "latest",
    difficulties = [],
    types = [],
    hazards = [],
    onlyFullArticle = true,
    projection = projectionListItem,
    /** 优先使用传入的 GROQ 查询 filter */
    filter,
}: Partial<
    ChallengeListQueryConditionType & { projection: string; filter: string }
> = {}) =>
    `${
        filter ||
        getGroqFiltersChallengeList({
            sort,
            difficulties,
            types,
            hazards,
            onlyFullArticle,
        })
    }{${projection}} | order(${
        sort === "latest"
            ? "airac_cyle desc, _updatedAt desc"
            : sort === "difficulty"
              ? "difficulty desc, aerodrome.icao asc, aerodrome.iata asc, aerodrome.faa, aerodrome.designator asc"
              : ""
    }) [${from}${length > 1 ? `...${from + length}` : ""}]`;

export const getGroqLatestChallenges = (length = 10) =>
    getGroqQueryChallengeList({ from: 0, length, sort: "latest" });

// ============================================================================

const actions = {
    fetchList: defineAction({
        input: z.custom<Partial<ChallengeListQueryConditionType>>(),
        handler: async ({
            from = 0,
            length = 20,
            catalog,
            // sort,
            difficulties,
            // types,
            hazards,
            // onlyFullArticle = true,
            ...params
        }) => {
            try {
                const defaults = {
                    sort: catalog === "latest" ? "latest" : "difficulty",
                    types:
                        catalog === "latest" ||
                        catalog === "filter" ||
                        catalog === "wip"
                            ? undefined
                            : [catalog],
                    onlyFullArticle: catalog === "wip" ? "no-airac" : true,
                } as Partial<ChallengeListQueryConditionType>;
                const sort = params.sort || defaults.sort;
                const types = params.types || defaults.types;
                const onlyFullArticle =
                    params.onlyFullArticle ?? defaults.onlyFullArticle;
                const groqQueryFilter = getGroqFiltersChallengeList({
                    difficulties,
                    types,
                    hazards,
                    onlyFullArticle,
                });
                // console.log({ onlyFullArticle, groqQueryFilter });
                const queryString = `{
'list': ${getGroqQueryChallengeList({ filter: groqQueryFilter, from, length, sort })},
'total': count(${groqQueryFilter})
}`;
                const res = (await fetch(queryString, {
                    transform: (res, queryString) => {
                        const r =
                            res as unknown as ChallengeListResponseDataType;
                        if (!r) {
                            const err = new ActionError({
                                message: E60000,
                                code: "NOT_FOUND",
                            });
                            err.cause = { GROQ: queryString };
                            throw err;
                        }
                        // res.forEach((post) => {
                        //     if (post.aerodrome.photo)
                        //         post.aerodrome.photo = transformImagePath(
                        //             post.aerodrome.photo
                        //         );
                        // });
                        // res[0].cover = transformImagePath(res[0].cover);
                        // const maxPage = Math.ceil(r.total / length);
                        // console.log(r.total, from, length, maxPage);
                        r.page = Math.floor(from / length) + 1;
                        return r as unknown as SanityDocument<ChallengeListResponseDataType>[];
                    },
                })) as unknown as ChallengeListResponseDataType;

                if (!res) {
                    const err = new ActionError({
                        message: E60000,
                        code: "NOT_FOUND",
                    });
                    err.cause = { GROQ: queryString };
                    throw err;
                }
                return res;
            } catch (err) {
                actionErrorHandler(err);
            }
        },
    }),

    /** 获取所有挑战条目列表 */
    fetchListAll: defineAction({
        handler: async () => {
            try {
                const queryString = `*[${getGroqFilterBase({
                    onlyFullArticle: false,
                })}]{${projectionListItem}} | order(${orderList})`;
                const res = await fetch<ChallengeListItemType>(queryString, {
                    transform: (res, queryString) => {
                        if (!res[0]) {
                            const err = new ActionError({
                                message: E60000,
                                code: "NOT_FOUND",
                            });
                            err.cause = { GROQ: queryString };
                            throw err;
                        }
                        // res.forEach((post) => {
                        //     if (post.aerodrome.photo)
                        //         post.aerodrome.photo = transformImagePath(
                        //             post.aerodrome.photo
                        //         );
                        // });
                        // res[0].cover = transformImagePath(res[0].cover);
                        return res;
                    },
                });

                if (!res) {
                    const err = new ActionError({
                        message: E60000,
                        code: "NOT_FOUND",
                    });
                    err.cause = { GROQ: queryString };
                    throw err;
                }
                return res;
            } catch (err) {
                actionErrorHandler(err);
            }
        },
    }),

    /** 获取挑战条目详情 */
    fetchItem: defineAction({
        input: z.string(),
        handler: async (_cmsIdOrSlug) => {
            const cmsIdOrSlug = getCmsIdOrSlug(_cmsIdOrSlug);
            try {
                const queryString = `*[${getGroqFilterBase({
                    onlyFullArticle: false,
                })} && ( _id == "${cmsIdOrSlug}" || slug.current == "${
                    cmsIdOrSlug
                }")]${getGroqProjection("details", { bracket: true })} | order( max_allowed_aircraft_category asc, aerodrome.icao asc )`;
                const res = (await fetch<ChallengeItemType>(queryString, {
                    transform: (res, queryString) => {
                        if (!res[0]) {
                            const err = new ActionError({
                                message: E60000,
                                code: "NOT_FOUND",
                            });
                            err.cause = { GROQ: queryString };
                            throw err;
                        }
                        // 处理图片路径
                        if (res[0].aerodrome.photo)
                            res[0].aerodrome.photo = transformImagePath(
                                res[0].aerodrome.photo,
                            );
                        if (res[0].briefing)
                            res[0].briefing = stringReplaceImagePath(
                                res[0].briefing,
                            );
                        // 处理机场相关视频的图片路径
                        if (Array.isArray(res[0].videos_this_aerodrome))
                            res[0].videos_this_aerodrome.forEach((post) => {
                                if (
                                    !res[0]
                                        .video_this_aerodrome_extreme_airport &&
                                    post.tags.some(
                                        ({ slug }) => slug === EXTREME_AIRPORT,
                                    )
                                ) {
                                    res[0].video_this_aerodrome_extreme_airport =
                                        {
                                            _id: post._id,
                                            slug: post.slug,
                                        };
                                }
                                post.cover = transformImagePath(post.cover);
                            });
                        return res[0] as unknown as SanityDocument<ChallengeItemType>[];
                    },
                })) as unknown as ChallengeItemType;

                if (!res) {
                    const err = new ActionError({
                        message: E60001,
                        code: "NOT_FOUND",
                    });
                    err.cause = { GROQ: queryString };
                    throw err;
                }
                return res;
            } catch (err) {
                actionErrorHandler(err);
            }
        },
    }),

    /**
     * 获取一个随机条目
     */
    fetchRandomItem: defineAction({
        input: z.custom<Partial<ChallengeListQueryConditionType>>(),
        handler: async ({
            difficulties,
            types,
            hazards,
            onlyFullArticle = false,
        }) => {
            try {
                const total = (await fetch(
                    `count(${getGroqFiltersChallengeList({
                        difficulties,
                        types,
                        hazards,
                        onlyFullArticle,
                    })})`,
                )) as unknown as number;
                const randomIndex = Math.floor(Math.random() * (total + 1));
                const queryString = getGroqQueryChallengeList({
                    difficulties,
                    types,
                    hazards,
                    onlyFullArticle,
                    from: randomIndex - 1,
                    length: 1,
                    projection: getGroqProjection("random-item"),
                });
                const res = await fetch<ChallengeItemType>(queryString);
                // console.log({ total, randomIndex, queryString, res });
                if (!res || (Array.isArray(res) && res.length === 0)) {
                    const err = new ActionError({
                        message: E60002,
                        code: "NOT_FOUND",
                    });
                    err.cause = { GROQ: queryString };
                    throw err;
                }
                return Array.isArray(res) ? res[0] : res;
            } catch (err) {
                actionErrorHandler(err);
            }
        },
    }),

    /** 获取挑战难点灾害列表 */
    fetchHazards: defineAction({
        handler: async () => {
            try {
                const queryString = `*[_type == "approach_challenge_hazard"] {
  _id,
  name,
  difficulty,
  comment,
  emoji
} | order(difficulty desc, name asc)`;
                const res = await fetch<{
                    _id: string;
                    name: string;
                    difficulty: ChallengeDifficultyType;
                    comment: string;
                    emoji: string;
                }>(queryString);
                return res;
            } catch (err) {
                actionErrorHandler(err);
            }
        },
    }),
};

export default actions;
