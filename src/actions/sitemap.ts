import type { SanityDocument } from "@sanity/client";
import { defineAction } from "astro:actions";
import { fetch } from "@/services/sanity";
import { type VideoItemType } from "@/types";
import actionErrorHandler from "./_error-handler";

export type VideoDocumentType = SanityDocument<
    Pick<VideoItemType, "_id" | "slug"> & {
        _updatedAt: string;
    }
>;
const cacheOptions = {
    ttl: 1 * 24 * 60 * 60_000, // 1 day
    refreshThreshold: 1 * 24 * 60 * 60_000 - 30 * 60_000, // elapsed: 30 min
};

const actions = {
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
};

export default actions;
