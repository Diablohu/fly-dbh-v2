import { z } from "astro/zod";
import { defineAction, ActionError } from "astro:actions";
import type { SanityDocument } from "@sanity/client";

import {
    type VideoListPageTypesType,
    type VideoItemType,
    type AerodromeItemType,
    type ChallengeItemType,
} from "@/types";
import { allLevel2Tags, defaultCacheTtl } from "@/global";

import { fetch } from "@/services/sanity";
import { transformImagePath } from "@/services/sanity-helpers";
import getVideoListPageTypeInfo from "@/utils/get-video-list-page-type-info";
import actionErrorHandler from "./_error-handler";
import { E20000, E20001 } from "@/constants/error-codes";

import { orderList } from "./challenge-page";

// ============================================================================

const getFilter = (type?: VideoListPageTypesType, slug?: string) => {
    if (!type) return "";
    switch (type) {
        case "tag": {
            return `("${slug}" in tags[]->slug.current || "${slug}" in tags[]->_id)`;
        }
        case "aerodrome": {
            return `("${slug}" in aerodromes[]->slug.current || "${slug}" in aerodromes[]->_id)`;
        }
        case "aircraftFamily": {
            return `("${slug}" in aircraft_families[]->slug.current || "${slug}" in aircraft_families[]->_id)`;
        }
        case "aircraftOnboardDevice": {
            return `("${slug}" in aircraft_onboard_devices[]->slug.current || "${slug}" in aircraft_onboard_devices[]->_id)`;
        }
        case "developer": {
            return `("${slug}" in developers[]->slug.current || "${slug}" in developers[]->_id)`;
        }
        case "platform": {
            return `("${slug}" in games[]->slug.current || "${slug}" in games[]->_id)`;
        }
        case "platformUpdate": {
            return `("${slug}" in msfs_updates[]->slug.current || "${slug}" in msfs_updates[]->_id)`;
        }
        case "event": {
            return `("${slug}" in events[]->slug.current || "${slug}" in events[]->_id)`;
        }
        default: {
        }
    }
    return "";
};
const getProjections = (type?: VideoListPageTypesType, slug?: string) => `{
    _id,
    'slug': slug.current,
    title,
    release,
    duration,
    "cover": cover.asset->path,
    'tags': tags[]->{
        _id,
        'slug': slug.current,
        "value": name,
        "name": title
    },
    links,
    ${
        (type === "tag" && slug === "news") || type === "aircraftFamily"
            ? `
    'developers': developers[]->{
        _id,
        'slug': slug.current,
        name
    },`
            : type === "tag" && ["review", "preview"].includes(slug || "")
              ? `
    'developers': developers[]->{
        _id,
        'slug': slug.current,
        name
    },
    'games': games[]->{
        _id,
        'slug': slug.current,
        name
    },`
              : ""
    }
}`;
type ReturnVideoItemType = Partial<VideoItemType> &
    Pick<VideoItemType, "_id" | "title" | "release" | "cover" | "tags">;
export type ResponseDataType = {
    list: ReturnVideoItemType[];
    total: number;
    page: number;
} & {
    [extra: string]: ReturnVideoItemType[];
};

// ============================================================================

const actions = {
    fetchList: defineAction({
        input: z.custom<{
            filters?: {
                type: VideoListPageTypesType;
                slug: string;
            }[];
            from?: number;
            length?: number;
            extra?: {
                name: string;
                query: string;
            }[];
        }>(),
        handler: async ({ filters, from = 0, length = 20, extra = [] }) => {
            try {
                const query = `*[_type == "video"${
                    Array.isArray(filters)
                        ? ` && ${
                              filters.length === 1
                                  ? getFilter(filters[0].type, filters[0].slug)
                                  : "(" +
                                    filters
                                        ?.filter(
                                            (filter) =>
                                                filter.type && filter.slug,
                                        )
                                        ?.map((filter) =>
                                            getFilter(filter.type, filter.slug),
                                        )
                                        .join(" && ") +
                                    ")"
                          }`
                        : ""
                }] ${getProjections(filters?.[0].type, filters?.[0].slug)} | order( release desc )`;
                // console.log({ query });
                return (await fetch(
                    `{
'list' : ${query}${filters?.some((filter) => filter.type === "aircraftFamily") ? "" : `[${from}...${from + length}]`},
'total' : count(${query}),
${extra.map(({ name, query }) => `'${name}' : ${query},`).join("\n")}
}`,
                    {
                        transform: (res, queryString) => {
                            const r = res as unknown as ResponseDataType;
                            if (!r) {
                                const err = new ActionError({
                                    message: E20000,
                                    code: "NOT_FOUND",
                                });
                                err.cause = { GROQ: queryString };
                                throw err;
                            }
                            for (const list of Object.values(r)) {
                                if (!Array.isArray(list)) continue;
                                list.forEach((post) => {
                                    post.cover = transformImagePath(post.cover);
                                });
                            }
                            // const maxPage = Math.ceil(r.total / length);
                            // console.log(r.total, from, length, maxPage);
                            r.page = Math.floor(from / length) + 1;
                            return r as unknown as SanityDocument<ReturnVideoItemType>[];
                        },
                    },
                )) as unknown as ResponseDataType;
            } catch (err) {
                actionErrorHandler(err);
            }
        },
    }),

    fetchInfo: defineAction({
        input: z.object({
            type: z.string(),
            slug: z.string(),
        }) as z.ZodType<{
            type: VideoListPageTypesType;
            slug: string;
        }>,
        handler: async ({ type, slug: cmsIdOrSlug }, context) => {
            try {
                const info = getVideoListPageTypeInfo(type);
                const res = (
                    await fetch(
                        `*[_type == "${info.type}" && ("${cmsIdOrSlug}" == slug.current || "${cmsIdOrSlug}" == _id)]{
    _id,
    'slug': slug.current,
${
    type === "tag"
        ? `
    tag_type,
    title,
`
        : type === "aerodrome"
          ? `
    name,
    icao,
    iata,
    location,
    'challenges': *[_type == "approach_challenge" && aerodrome->_id == ^._id]{
        _id,
        'slug': slug.current,
        name,
        difficulty,
        max_allowed_aircraft_category,
    } | order(${orderList}),
`
          : type === "aircraftFamily"
            ? `
    name,
    'maker': maker->name_zh_cn,
    aircrafts[]{
        icao_code,
        name,
    },
    'onboard_devices': onboard_devices[]->{
        'maker': maker->name_zh_cn,
        name,
        _id,
    },
    'tags': tags[]->{
        name,
        _id,
    }
`
            : type === "aircraftOnboardDevice"
              ? `
    name,
    'maker': maker->name_zh_cn,
    'tags': tags[]->{
        name,
        _id,
    }
`
              : type === "developer"
                ? `
    name,
    name_full,
    links,
    "logo": logo.asset->path,
`
                : type === "platform"
                  ? `
    name,
    name_full,
    links,
    'developers': developers[]->{
        _id,
        'slug': slug.current,
        name
    },
`
                  : type === "platformUpdate"
                    ? `
    'game': platform->name,
    series,
    number,
    release
`
                    : type === "event"
                      ? `
    name,
    name_full,
    start,
    end,
    type,
    links,
`
                      : ``
}
}`,
                        {
                            transform: (res, queryString) => {
                                const r = res[0];
                                if (!r) {
                                    const err = new ActionError({
                                        message: E20001,
                                        code: "NOT_FOUND",
                                    });
                                    err.cause = { GROQ: queryString };
                                    throw err;
                                }
                                if (r.logo) r.logo = transformImagePath(r.logo);
                                return [r];
                            },
                            ttl: defaultCacheTtl * 3,
                        },
                    )
                )[0];
                return res as unknown as {
                    _id: string;
                    slug?: string;

                    name?: string;
                    name_full?: string;
                    title?: string;
                    tag_type?: string;

                    maker?: string;
                    aircrafts?: {
                        icao_code: string;
                        name: string;
                    }[];
                    onboard_devices?: {
                        maker: string;
                        name: string;
                        _id: string;
                    }[];
                    tags?: {
                        name: string;
                        _id: string;
                    }[];
                    links?: { [key: string]: string };
                    logo?: string;
                    developers?: {
                        _id: string;
                        slug?: string;
                        name: string;
                    }[];
                    game?: string;
                    series?: string;
                    number?: number;
                    release?: string;
                    start?: string;
                    end?: string;
                    type?: string;

                    challenges?: ChallengeItemType["other_challenges_this_aerodrome"];
                } & Partial<
                    Pick<AerodromeItemType, "icao" | "iata" | "location">
                >;
            } catch (err) {
                actionErrorHandler(err, context);
            }
        },
    }),

    fetchTags: defineAction({
        input: z.object({
            type: z.string().optional(),
        }) as z.ZodType<{
            type?: VideoListPageTypesType | "tagSubCategory";
        }>,
        handler: async ({ type }) => {
            try {
                const currentType = !type
                    ? "tag"
                    : type === "tagSubCategory"
                      ? "tag"
                      : getVideoListPageTypeInfo(type).type;
                return await fetch<{
                    _id: string;
                    slug?: string;

                    title?: string;
                    tag_type?: "category" | "topic";
                    name?: string;
                    name_full?: string;
                    icao?: string;
                    iata?: string;
                    maker?: string;
                    aircrafts?: {
                        icao_code: string;
                        name: string;
                    }[];
                    game?: string;
                    series?: string;
                    number?: number;
                    release?: string;
                    start?: string;
                    end?: string;
                    type?: string;
                }>(
                    `
*[_type == "${currentType}"${
                        type === "aircraftFamily"
                            ? ` && (
    count(*[_type == 'video' && references(^._id)]) > 0
    || (defined(onboard_devices) && count(*[_type == 'video' && references(^.onboard_devices[]->_id)]) > 0)
)`
                            : type
                              ? ` && count(*[_type == 'video' && references(^._id)]) > 0`
                              : ""
                    }${
                        type === "tagSubCategory"
                            ? ` && tag_type == "topic" && !(slug.current in [${allLevel2Tags
                                  .map((s) => `"${s}"`)
                                  .join(",")}])`
                            : ""
                    }] | order(${
                        currentType === "tag"
                            ? `sort asc`
                            : type === "aerodrome"
                              ? "icao asc"
                              : type === "aircraftFamily"
                                ? "maker->icao_code asc, name asc"
                                : type === "aircraftOnboardDevice"
                                  ? "maker->icao_code asc, name asc"
                                  : type === "developer"
                                    ? "name asc"
                                    : type === "platform"
                                      ? "name_full asc"
                                      : type === "platformUpdate"
                                        ? "release desc, number desc"
                                        : type === "event"
                                          ? "start desc"
                                          : ""
                    }) {
    _id,
    'slug': slug.current,${
        currentType === "tag"
            ? `
    title,
    tag_type,`
            : type === "aerodrome"
              ? `
    name,
    icao,
    iata,`
              : type === "aircraftFamily"
                ? `
    name,
    'maker': maker->name_zh_cn,
    aircrafts[]{
        icao_code,
        name,
    },`
                : type === "aircraftOnboardDevice"
                  ? `
    name,
    'maker': maker->name_zh_cn,`
                  : type === "developer"
                    ? `
    name,
    name_full,`
                    : type === "platform"
                      ? `
    name,
    name_full,`
                      : type === "platformUpdate"
                        ? `
    'game': platform->name,
    series,
    number,
    release,`
                        : type === "event"
                          ? `
    name,
    name_full,
    type,
    start,
    end,`
                          : ""
    }
}
                `,
                    {
                        ttl: defaultCacheTtl * 3,
                    },
                );
            } catch (err) {
                actionErrorHandler(err);
            }
        },
    }),
};

export default actions;
