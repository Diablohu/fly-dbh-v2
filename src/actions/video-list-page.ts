import { z } from "astro:schema";
import { defineAction, ActionError } from "astro:actions";
import type { SanityDocument } from "@sanity/client";

import { type VideoListPageTypesType, type VideoItemType } from "@/types";
import { specialTagsTutorial, defaultCacheTtl } from "@/global";

import { fetch } from "@/services/sanity";
import { transformImagePath } from "@/utils/sanity-helpers";
import getVideoListPageTypeInfo from "@/utils/get-video-list-page-type-info";
import actionErrorHandler from "./_error-handler";
import { E20000, E20001 } from "@/constants/error-codes";

// ============================================================================

const getFilter = (type?: VideoListPageTypesType, slug?: string) => {
    if (!type) return "";
    switch (type) {
        case "tag": {
            return ` && ("${slug}" in tags[]->slug.current || "${slug}" in tags[]->_id)`;
        }
        case "aerodrome": {
            return ` && ("${slug}" in aerodromes[]->slug.current || "${slug}" in aerodromes[]->_id)`;
        }
        case "aircraftFamily": {
            return ` && ("${slug}" in aircraft_families[]->slug.current || "${slug}" in aircraft_families[]->_id)`;
        }
        case "aircraftOnboardDevice": {
            return ` && ("${slug}" in aircraft_onboard_devices[]->slug.current || "${slug}" in aircraft_onboard_devices[]->_id)`;
        }
        case "developer": {
            return ` && ("${slug}" in developers[]->slug.current || "${slug}" in developers[]->_id)`;
        }
        case "platform": {
            return ` && ("${slug}" in games[]->slug.current || "${slug}" in games[]->_id)`;
        }
        case "platformUpdate": {
            return ` && ("${slug}" in msfs_updates[]->slug.current || "${slug}" in msfs_updates[]->_id)`;
        }
        case "event": {
            return ` && ("${slug}" in events[]->slug.current || "${slug}" in events[]->_id)`;
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
    "cover": cover.asset->path,
    'tags': tags[]->{
        _id,
        'slug': slug.current,
        "value": name,
        "name": title
    },
    ${
        type === "tag" && slug === "news"
            ? `'developers': developers[]->{
        _id,
        'slug': slug.current,
        name
    },`
            : type === "tag" && slug === "review"
              ? `'developers': developers[]->{
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
type ResponseDataType = {
    list: ReturnVideoItemType[];
    total: number;
    page: number;
} & {
    [extra: string]: ReturnVideoItemType[];
};

// ============================================================================

const actions = {
    videoListPageFetch: defineAction({
        input: z.object({
            type: z.string().optional(),
            slug: z.string().optional(),
            from: z.number().optional(),
            length: z.number().optional(),
            extra: z
                .array(
                    z.object({
                        name: z.string(),
                        query: z.string(),
                    })
                )
                .optional(),
        }) as z.ZodType<{
            type?: VideoListPageTypesType;
            slug?: string;
            from?: number;
            length?: number;
            extra?: {
                name: string;
                query: string;
            }[];
        }>,
        handler: async ({
            type,
            slug: cmsIdOrSlug,
            from = 0,
            length = 20,
            extra = [],
        }) => {
            try {
                const query = `*[_type == "video"${getFilter(type, cmsIdOrSlug)}] ${getProjections(type, cmsIdOrSlug)} | order( release desc )`;
                // console.log({ query });
                return (await fetch(
                    `{
'list' : ${query}${type === "aircraftFamily" ? "" : `[${from}...${from + length}]`},
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
                    }
                )) as unknown as ResponseDataType;
            } catch (err) {
                actionErrorHandler(err);
            }
        },
    }),

    videoListPageFetchInfo: defineAction({
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
    iata
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
                        }
                    )
                )[0];
                return res as unknown as {
                    _id: string;
                    slug?: string;

                    name?: string;
                    name_full?: string;
                    title?: string;
                    tag_type?: string;
                    icao?: string;
                    iata?: string;
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
                };
            } catch (err) {
                actionErrorHandler(err, context);
            }
        },
    }),

    videoListPageFetchTags: defineAction({
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
                        type
                            ? ` && count(*[_type == 'video' && references(^._id)]) > 0`
                            : ""
                    }${
                        type === "tagSubCategory"
                            ? ` && tag_type == "topic" && !(slug.current in [${specialTagsTutorial.map((s) => `"${s}"`).join(",")}])`
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
                                        ? "release desc"
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
                    }
                );
            } catch (err) {
                actionErrorHandler(err);
            }
        },
    }),
};

export default actions;
