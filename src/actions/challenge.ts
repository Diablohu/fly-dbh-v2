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

// ============================================================================

export type ChallengeListResponseDataType = {
    list: ChallengeItemType[];
    total: number;
    page: number;
};

export const orderList = `max_allowed_aircraft_category asc, difficulty desc, aerodrome.icao asc, aerodrome.iata asc, aerodrome.faa, aerodrome.designator asc`;

const getGroqProjection = (
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
'other_challenges_this_aerodrome': *[_type == "approach_challenge" && aerodrome->_id == ^.aerodrome->_id && _id != ^._id]{
    _id,
    'slug': slug.current,
    name,
    difficulty,
    max_allowed_aircraft_category,
    typical_aircraft_types,
} | order(${orderList})`,
            videos &&
                `
video_url_briefing,
'videos_this_aerodrome':  *[_type == "video" && references(^.aerodrome->_id)]{
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

const getGroqFiltersChallengeList = ({
    // sort = "latest",
    difficulties = [],
    types = [],
    hazards = [],
    isFullArticle = true,
}: Partial<
    Pick<
        ChallengeListQueryConditionType,
        "sort" | "difficulties" | "types" | "hazards" | "isFullArticle"
    >
> = {}) =>
    `*[_type == "approach_challenge" ${
        // 查询完整文章时，添加条件：必须有 `airac_cyle` 字段
        (isFullArticle ? "&& defined(airac_cyle)" : "") +
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
                  .map((hazard) => `&& "${hazard}" in hazards[].hazard->_id`)
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
    isFullArticle = true,
    projection = projectionListItem,
}: Partial<ChallengeListQueryConditionType & { projection: string }> = {}) =>
    `${getGroqFiltersChallengeList({
        sort,
        difficulties,
        types,
        hazards,
        isFullArticle,
    })}{${projection}} | order(${
        sort === "latest"
            ? "airac_cyle desc, _createdAt desc"
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
            sort,
            difficulties,
            types,
            hazards,
            isFullArticle = true,
        }) => {
            try {
                const queryString = `{
'list': ${getGroqQueryChallengeList({ from, length, sort, difficulties, types, hazards, isFullArticle })},
'total': count(${getGroqFiltersChallengeList({ sort, difficulties, types, hazards, isFullArticle })})
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
                const queryString = `*[_type == "approach_challenge"] {${projectionListItem}} | order(${orderList})`;
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
        handler: async (cmsIdOrSlug) => {
            try {
                const queryString = `*[_type == "approach_challenge" && ( _id == "${
                    cmsIdOrSlug
                }" || slug.current == "${
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
            isFullArticle = false,
        }) => {
            try {
                const total = (await fetch(
                    `count(${getGroqFiltersChallengeList({
                        difficulties,
                        types,
                        hazards,
                        isFullArticle,
                    })})`,
                )) as unknown as number;
                const randomIndex = Math.floor(Math.random() * (total + 1));
                const queryString = getGroqQueryChallengeList({
                    difficulties,
                    types,
                    hazards,
                    isFullArticle,
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
