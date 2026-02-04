import type { SanityDocument } from "@sanity/client";
import { z } from "astro:schema";
import { defineAction, ActionError } from "astro:actions";
import { fetch } from "@/services/sanity";
import {
    transformImagePath,
    stringReplaceImagePath,
} from "@/services/sanity-helpers";
import actionErrorHandler from "./_error-handler";
import { E60000, E60001 } from "@/constants/error-codes";
import { EXTREME_AIRPORT } from "@/constants/video-tags";
import {
    type ChallengeListItemType,
    type ChallengeItemType,
    type ChallengeDifficultyType,
    type AircraftTypes,
} from "@/types";

// ============================================================================

type SortType = "latest" | "difficulty";
export type ChallengeListResponseDataType = {
    list: ChallengeItemType[];
    total: number;
    page: number;
};

export const orderList = `max_allowed_aircraft_category asc, difficulty desc, aerodrome.icao asc, aerodrome.iata asc, aerodrome.faa asc`;

const projectionListItem = `
  _id,
  _createdAt,
  'slug': slug.current,
  'aerodrome': aerodrome->{
    _id,
    'slug': slug.current,
    name,
    icao,
    iata,
    faa,
    location,
  },
  name,
  difficulty,
  airac_cyle,
  max_allowed_aircraft_category,
  typical_aircraft_types,`;

const getGroqFiltersChallengeList = ({
    sort = "latest",
    types = [],
    hazards = [],
}: {
    sort?: SortType;
    types?: AircraftTypes[];
    hazards?: string[];
} = {}) =>
    `*[_type == "approach_challenge" ${
        // 按时间排序时，必须有 `airac_cyle` 字段
        (sort === "latest" ? "&& defined(airac_cyle)" : "") +
        // 筛选机型
        (Array.isArray(types) && types.length > 0
            ? types.map((type) => `&& "${type}" in typical_aircraft_types`)
            : "") +
        // 筛选难点灾害
        (Array.isArray(hazards) && hazards.length > 0
            ? hazards.map((hazard) => `&& "${hazard}" in hazards[].hazard->_id`)
            : [])
    }]`;

export const getGroqQueryChallengeList = ({
    from = 0,
    length = 10,
    sort = "latest",
    types = [],
    hazards = [],
}: {
    from?: number;
    length?: number;
    sort?: SortType;
    types?: AircraftTypes[];
    hazards?: string[];
} = {}) =>
    `${getGroqFiltersChallengeList({
        sort,
        types,
        hazards,
    })}{${projectionListItem}} | order(${
        sort === "latest"
            ? "airac_cyle desc, _createdAt desc"
            : sort === "difficulty"
              ? "difficulty desc, aerodrome.icao asc, aerodrome.iata asc, aerodrome.faa asc"
              : ""
    }) [${from}...${from + length}]`;

export const getGroqLatestChallenges = (length = 10) =>
    getGroqQueryChallengeList({ from: 0, length, sort: "latest" });

// ============================================================================

const actions = {
    fetchList: defineAction({
        input: z.object({
            from: z.number().optional(),
            length: z.number().optional(),
            sort: z.string().optional(),
            types: z.array(z.string()).optional(),
            hazards: z.array(z.string()).optional(),
        }) as z.ZodType<{
            from?: number;
            length?: number;
            sort?: SortType;
            types?: AircraftTypes[];
            hazards?: string[];
        }>,
        handler: async ({ from = 0, length = 20, sort, types, hazards }) => {
            try {
                const queryString = `{
'list': ${getGroqQueryChallengeList({ from, length, sort, types, hazards })},
'total': count(${getGroqFiltersChallengeList({ sort, types, hazards })})
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
    fetchChallenge: defineAction({
        input: z.string(),
        handler: async (cmsIdOrSlug) => {
            try {
                const queryString = `*[_type == "approach_challenge" && ( _id == "${cmsIdOrSlug}" || slug.current == "${cmsIdOrSlug}")] {
  _id,
  name,
  type,
  airac_cyle,
  typical_aircrafts,
  difficulty,
  'hazards': hazards[]{
    ...hazard->{
      name,
      emoji,
      difficulty,
      comment,
    },
    extra_comment,
  },
  max_allowed_aircraft_category,
  typical_aircraft_types,
  'aerodrome': aerodrome->{
    _id,
    'slug': slug.current,
    name,
    icao,
    iata,
    faa,
    location,
    'runways': runways[]{
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
    },
  },
  runways[],
  'route': {
    'origin': routeOrigin->{
      _id,
      'slug': slug.current,
      name,
      icao,
      iata,
      faa,
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
      icao,
      iata,
      faa,
    },
    'star': routeSTAR[]{
      rwy,
      star,
    },
    'app': routeAPP,
    'distance': routeDistance,
    'cruise': routeCruise,
  },
  briefing,
  'other_challenges_this_aerodrome': *[_type == "approach_challenge" && aerodrome->_id == ^.aerodrome->_id && _id != ^._id]{
      _id,
      'slug': slug.current,
      name,
      difficulty,
      max_allowed_aircraft_category,
  } | order(${orderList}),
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
  },
} | order( max_allowed_aircraft_category asc, aerodrome.icao asc )`;
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
                        // 按难度排序难点灾害，由难到易
                        res[0].hazards.sort(
                            (a, b) => b.difficulty - a.difficulty,
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
