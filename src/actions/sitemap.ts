import { defineAction } from "astro:actions";
import { fetch } from "@/services/sanity";
import { type VideoItemType, type ChallengeItemType } from "@/types";
import { getGroqFilterBase as getChallengeGroqFilterBase } from "@/actions/challenge";
import actionErrorHandler from "./_error-handler";
import getGroqFilterVideo from "@/utils/groq/get-filter-video";

const cacheOptions = {
    maxAge: 1 * 24 * 60 * 60_000 - 30 * 60_000, // elapsed: 30 min
    staleWhieRevalidate: 1 * 24 * 60 * 60_000, // 1 day
};

const actions = {
    /** 
     // #region 全列表：视频
     */
    fetchVideos: defineAction({
        handler: async () => {
            try {
                const queryString = `\
${getGroqFilterVideo("")} {
    _id,
    'slug': slug.current,
    release,
    _updatedAt,
} | order( release desc )`;
                return await fetch<
                    Pick<VideoItemType, "_id" | "slug"> & {
                        _updatedAt: string;
                    }
                >(queryString, {
                    cache: { key: ["sitemap", "videos"], ...cacheOptions },
                });
            } catch (err) {
                actionErrorHandler(err);
            }
        },
    }),

    /** 
     // #region TODO: 全列表：视频分类
     */
    fetchVideoCategories: defineAction({
        handler: async () => {
            try {
                const queryString = `\
*[_type == "tag"] {
    _id,
    'slug': slug.current,
} | order( sort asc )`;
                return await fetch<
                    Pick<VideoItemType, "_id" | "slug"> & {
                        _updatedAt: string;
                    }
                >(queryString, {
                    cache: {
                        key: ["sitemap", "video-categories"],
                        ...cacheOptions,
                    },
                });
            } catch (err) {
                actionErrorHandler(err);
            }
        },
    }),

    /** 
     // #region 全列表：挑战（完整文章）
     */
    fetchChallenges: defineAction({
        handler: async () => {
            try {
                const queryString = `\
*[${getChallengeGroqFilterBase({ onlyFullArticle: true })}] {
    _id,
    'slug': slug.current,
    _updatedAt,
    'aerodrome': aerodrome->{
        _updatedAt
    }
} | order( aerodrome._updatedAt desc, _updatedAt desc )`;
                return await fetch<
                    Pick<ChallengeItemType, "_id" | "slug"> & {
                        _updatedAt: string;
                        aerodrome: {
                            _updatedAt: string;
                        };
                    }
                >(queryString, {
                    cache: { key: ["sitemap", "challenges"], ...cacheOptions },
                });
            } catch (err) {
                actionErrorHandler(err);
            }
        },
    }),
};

export default actions;
