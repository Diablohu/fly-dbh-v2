import { defineAction, ActionError } from "astro:actions";

import { type VideoItemType, type ChallengeListItemType } from "@/types";
import { getGroqProjection } from "@/actions/challenge";

import { fetch } from "@/services/sanity";
// import { transformImagePath } from "@/services/sanity-helpers";
import actionErrorHandler from "./_error-handler";
import { E40000 } from "@/constants/error-codes";
import getGroqFilterVideo from "@/utils/groq/get-filter-video";

// ============================================================================

const getProjections = () => `{
    _id,
    _createdAt,
    'slug': slug.current,

    title,
    'tags': tags[]->{
        _id,
        'slug': slug.current,
        "name": title
    },
    release,
    description,

    ${getGroqProjection("list-item")}
}`;
type ReturnVideoItemType = {
    _id: string;
    _createdAt: string;
    slug: string;
} & Pick<VideoItemType, "title" | "tags" | "release" | "description"> &
    Pick<
        ChallengeListItemType,
        "name" | "difficulty" | "aerodrome" | "typical_aircraft_types"
    >;

// ============================================================================

const actions = {
    fetch: defineAction({
        handler: async () => {
            try {
                // console.log({ query });
                return await fetch<ReturnVideoItemType>(
                    `*[${getGroqFilterVideo("", {
                        noBracket: true,
                    })} || (_type == "approach_challenge" && defined(airac_cyle))] ${getProjections()} | order( _createdAt desc ) [0...20]`,
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
                            // res.forEach((post) => {
                            //     if (post.cover)
                            //         post.cover = transformImagePath(post.cover);
                            // });
                            return res;
                        },
                    },
                );
            } catch (err) {
                actionErrorHandler(err);
            }
        },
    }),
};

export default actions;
