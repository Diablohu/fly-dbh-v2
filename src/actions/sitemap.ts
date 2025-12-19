import { defineAction } from "astro:actions";
import { fetch } from "@/services/sanity";
import { type VideoItemType, type ChallengeItemType } from "@/types";
import actionErrorHandler from "./_error-handler";

const cacheOptions = {
    ttl: 1 * 24 * 60 * 60_000, // 1 day
    refreshThreshold: 1 * 24 * 60 * 60_000 - 30 * 60_000, // elapsed: 30 min
};

const actions = {
    /** 
     // #region 全列表：视频
     */
    fetchVideos: defineAction({
        handler: async () => {
            try {
                const queryString = `\
*[_type == "video"] {
    _id,
    'slug': slug.current,
    release,
    _updatedAt,
} | order( release desc ) [0...1000]
`;
                return await fetch<
                    Pick<VideoItemType, "_id" | "slug"> & {
                        _updatedAt: string;
                    }
                >(queryString, { ...cacheOptions });
            } catch (err) {
                actionErrorHandler(err);
            }
        },
    }),

    /** 
     // #region TODO: 全列表：视频分类
     */

    /** 
     // #region 全列表：挑战
     */
    fetchChallenges: defineAction({
        handler: async () => {
            try {
                const queryString = `\
*[_type == "approach_challenge"] {
    _id,
    'slug': slug.current,
    _updatedAt,
    'aerodrome': aerodrome->{
        _updatedAt
    }
} | order( aerodrome._updatedAt desc, _updatedAt desc ) [0...1000]
`;
                return await fetch<
                    Pick<ChallengeItemType, "_id" | "slug"> & {
                        _updatedAt: string;
                        aerodrome: {
                            _updatedAt: string;
                        };
                    }
                >(queryString, { ...cacheOptions });
            } catch (err) {
                actionErrorHandler(err);
            }
        },
    }),
};

export default actions;
