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
} from "@/types";

export const orderList = `max_allowed_aircraft_category asc, difficulty desc, aerodrome.icao asc`;

const actions = {
    fetchList: defineAction({
        handler: async () => {
            try {
                const queryString = `*[_type == "approach_challenge"] {
  _id,
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
  max_allowed_aircraft_category
} | order(${orderList})`;
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
      _id, 'slug': slug.current, name,icao,iata,
    },
    'sid': routeSID[]{
      rwy,
      sid,
    },
    'enroute': routeEnroute,
    'destination': routeDestination->{
      _id, 'slug': slug.current, name,icao,iata,
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
                                res[0].aerodrome.photo
                            );
                        if (res[0].briefing)
                            res[0].briefing = stringReplaceImagePath(
                                res[0].briefing
                            );
                        // 按难度排序难点灾害，由难到易
                        res[0].hazards.sort(
                            (a, b) => b.difficulty - a.difficulty
                        );
                        // 处理机场相关视频的图片路径
                        if (Array.isArray(res[0].videos_this_aerodrome))
                            res[0].videos_this_aerodrome.forEach((post) => {
                                if (
                                    !res[0]
                                        .video_this_aerodrome_extreme_airport &&
                                    post.tags.some(
                                        ({ slug }) => slug === EXTREME_AIRPORT
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

    fetchLatest: defineAction({
        input: z.object({
            length: z.number().optional(),
        }),
        handler: async ({ length = 10 }) => {
            try {
                const queryString = `*[_type == "approach_challenge"] {
  _id,
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
  max_allowed_aircraft_category
} | order( _updateAt desc ) [0...${length}]`;
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
