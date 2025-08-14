import { defineAction, ActionError } from "astro:actions";
import { z } from "astro:schema";
import type { SanityDocument } from "@sanity/client";

import { type VideoItemType } from "@/types";

import { fetch } from "@/services/sanity";
import { transformImagePath } from "@/utils/sanity-helpers";
import actionErrorHandler from "./_error-handler";
import { E40000 } from "@/constants/error-codes";

import { type ResponseDataType as VideoListDataType } from "@/actions/video-list-page";

// ============================================================================

const defaultLength = 10;

// ============================================================================

type ResultType = {
    videos: SanityDocument<
        Partial<VideoItemType> &
            Pick<
                VideoItemType,
                "_id" | "title" | "release" | "cover" | "tags" | "links"
            >
    >[];
    videosTotal: number;
    // categories: SanityDocument<{
    //     _id: string;
    //     slug?: string;
    //     title: string;
    //     tag_type: string;
    // }>[];
    aircraftFamilies: SanityDocument<{
        _id: string;
        slug?: string;
        name: string;
        maker: {
            icao_code: string;
            name: string;
            name_zh_cn?: string;
        };
        aircrafts: { icao_code: string; name: string }[];
    }>[];
};

const keywordRegex = {
    tutorial: /教学|教程|攻略|上手|指南/,
    review: /评测|测评|试飞|体验|简评/,
};

function getValues(keyword: string) {
    const isTutorial = keywordRegex.tutorial.test(keyword);
    const isReview = keywordRegex.review.test(keyword);

    if (isTutorial) keyword = keyword.replace(keywordRegex.tutorial, "");
    if (isReview) keyword = keyword.replace(keywordRegex.review, "");
    keyword = keyword.trim();

    const keywords = [
        ...new Set([
            keyword,
            keyword.replace(/([a-z])([0-9])/gi, "$1-$2"),
            keyword.replace(/^[a-z]{1}([0-9a-z]{3})/gi, "$1"),
        ]),
    ];
    const getKeywordFilter = (name: string) =>
        `(${keywords.map((keyword) => `${name} match "*${keyword}*"`).join(" || ")})`;
    const getKeywordFilterTags = () => {
        const checkTags = [
            isTutorial ? "tutorial" : null,
            isReview ? "review" : null,
        ].filter(Boolean) as string[];

        if (!checkTags.length) return "";
        return ` && (${checkTags.map((slug) => `"${slug}" in tags[]->slug.current`).join(" || ")})`;
    };

    const groqVideos = `*[_type == "video" && ${getKeywordFilter("title")}${getKeywordFilterTags()}]
    | order( release desc )
    {
        _id,
        "slug": slug.current,
        title,
        'tags': tags[]->{
            _id,
            "slug": slug.current,
            "name": title
        },
        release,
        description,
        links,
        "cover": cover.asset->path,
    }`;

    return {
        keywords,
        getKeywordFilter,
        groqVideos,
    };
}

// ============================================================================

const actions = {
    query: defineAction({
        input: z.object({
            keyword: z.string(),
        }),
        handler: async ({ keyword }) => {
            if (!keyword) {
                const err = new ActionError({
                    message: E40000,
                    code: "NOT_FOUND",
                });
                err.cause = { reason: "no keyword" };
                throw err;
            }
            try {
                const { getKeywordFilter, groqVideos } = getValues(keyword);
                return (await fetch(
                    `{
'videos': ${groqVideos}[0...${defaultLength}],
'videosTotal' : count(${groqVideos}),

'aircraftFamilies': *[_type == "aircraft_family" && (${getKeywordFilter("name")} || ${getKeywordFilter("aircrafts[].name")} || aircrafts[].icao_code match "*${keyword}*")]
    | order( maker->icao_code asc, name asc )
    {
        _id,
        "slug": slug.current,
        name,
        'maker': maker->{
            icao_code,
            name,
            name_zh_cn,
        },
        aircrafts[]{icao_code, name},
    }
    [0...10],
}`,
                    {
                        transform: (res, queryString) => {
                            if (!res) {
                                const err = new ActionError({
                                    message: E40000,
                                    code: "NOT_FOUND",
                                });
                                err.cause = { GROQ: queryString };
                                throw err;
                            }

                            (res as unknown as ResultType).videos.forEach(
                                (post) => {
                                    post.cover = transformImagePath(post.cover);
                                }
                            );

                            return res;
                        },
                    }
                )) as unknown as ResultType;
            } catch (err) {
                actionErrorHandler(err);
            }
        },
    }),

    fetchVideos: defineAction({
        input: z.object({
            keyword: z.string(),
            from: z.number().optional(),
            length: z.number().optional(),
        }),
        handler: async ({ keyword, from = 0, length = defaultLength }) => {
            if (!keyword) {
                const err = new ActionError({
                    message: E40000,
                    code: "NOT_FOUND",
                });
                err.cause = { reason: "no keyword" };
                throw err;
            }
            try {
                const { groqVideos } = getValues(keyword);
                return (await fetch(
                    `{
'list': ${groqVideos}[${from}...${from + length}],
'total' : count(${groqVideos}),
}`,
                    {
                        transform: (res, queryString) => {
                            if (!res) {
                                const err = new ActionError({
                                    message: E40000,
                                    code: "NOT_FOUND",
                                });
                                err.cause = { GROQ: queryString };
                                throw err;
                            }

                            (res as unknown as VideoListDataType).list.forEach(
                                (post) => {
                                    post.cover = transformImagePath(post.cover);
                                }
                            );

                            return res;
                        },
                    }
                )) as unknown as VideoListDataType;
            } catch (err) {
                actionErrorHandler(err);
            }
        },
    }),
};

export default actions;

/*
'categories': *[_type == "tag" && title match "*${keyword}*"]
    | order( sort asc )
    {
        _id,
        "slug": slug.current,
        title,
        tag_type,
    }
    [0...5],
*/
