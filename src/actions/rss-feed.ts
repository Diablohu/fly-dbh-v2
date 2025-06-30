import { defineAction, ActionError } from "astro:actions";

import { type VideoItemType } from "@/types";

import { fetch } from "@/services/sanity";
import { transformImagePath } from "@/utils/sanity-helpers";
import actionErrorHandler from "./_error-handler";
import { E40000 } from "@/constants/error-codes";

// ============================================================================

const getProjections = () => `{
    _id,
    'slug': slug.current,
    title,
    'tags': tags[]->{
        _id,
        'slug': slug.current,
        "name": title
    },
    release,
    duration,
    "cover": cover.asset->path,
    "cover_dimensions": cover.asset->{
        'width': metadata.dimensions.width,
        'height': metadata.dimensions.height
    },
    description,
    links,
}`;
type ReturnVideoItemType = Partial<VideoItemType> &
    Pick<
        VideoItemType,
        "_id" | "title" | "release" | "cover" | "tags" | "description"
    >;

// ============================================================================

const actions = {
    rssFeedFetch: defineAction({
        handler: async () => {
            try {
                // console.log({ query });
                return await fetch<ReturnVideoItemType>(
                    `*[_type == "video"] ${getProjections()} | order( release desc ) [0...10]`,
                    {
                        transform: (res, queryString) => {
                            if (!res || !Array.isArray(res) || !res.length) {
                                const err = new ActionError({
                                    message: E40000,
                                    code: "NOT_FOUND",
                                });
                                err.cause = { GROQ: queryString };
                                throw err;
                            }
                            res.forEach((post) => {
                                post.cover = transformImagePath(post.cover);
                            });
                            return res;
                        },
                    }
                );
            } catch (err) {
                actionErrorHandler(err);
            }
        },
    }),
};

export default actions;
