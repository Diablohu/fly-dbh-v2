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
import { type ChallengeListItemType, type ChallengeItemType } from "@/types";

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
} | order( max_allowed_aircraft_category asc, difficulty asc, aerodrome.icao asc )`;
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
  },
  runways[],
  'route': {
    'origin': routeOrigin->{
      _id, 'slug': slug.current, name,icao,iata,
    },
    'sid': routeSID,
    'enroute': routeEnroute,
    'destination': routeDestination->{
      _id, 'slug': slug.current, name,icao,iata,
    },
    'star': routeSTAR,
    'app': routeAPP,
    'distance': routeDistance,
    'cruise': routeCruise,
  },
  briefing,
  'other_challenges_this_aerodrome': *[_type == "approach_challenge" && references(^.aerodrome->_id) && _id != ^._id]{
      _id,
      'slug': slug.current,
      name,
      difficulty,
      max_allowed_aircraft_category,
  },
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
};

export default actions;
