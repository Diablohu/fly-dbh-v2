import { z } from "astro:schema";
import { defineAction, ActionError } from "astro:actions";
import type { SanityDocument } from "@sanity/client";

import { type VideoListPageTypesType, type VideoItemType } from "@/types";

import { fetch } from "@/services/sanity";
import { transformImagePath } from "@/utils/sanity-helpers";
import getVideoListPageTypeInfo from "@/utils/get-video-list-page-type-info";
import actionErrorHandler from "./_error-handler";

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
        case "developer": {
            return ` && ("${slug}" in developers[]->slug.current || "${slug}" in developers[]->_id)`;
        }
        case "platform": {
            return ` && ("${slug}" in games[]->slug.current || "${slug}" in games[]->_id)`;
        }
        case "platformUpdate": {
            return ` && ("${slug}" in msfs_updates[]->slug.current || "${slug}" in msfs_updates[]->_id)`;
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
// const fetchProjections = `{
//     _id,
//     'slug': slug.current,
//     title,
//     release,
//     "cover": cover.asset->path,
//     description,
//     links,
//     'aircraft_families': aircraft_families[]->{
//         _id,
//         'slug': slug.current,
//         name,
//         'maker': maker->name_zh_cn
//     },
//     'aerodromes': aerodromes[]->{
//         _id,
//         'slug': slug.current,
//         name,
//         icao,
//         iata
//     },
//     'developers': developers[]->{
//         _id,
//         'slug': slug.current,
//         name
//     },
//     'games': games[]->{
//         _id,
//         'slug': slug.current,
//         name
//     },
//     'msfs_updates': msfs_updates[]->{
//         _id,
//         'slug': slug.current,
//         game,
//         series,
//         number,
//         release
//     }
// }`;
// links
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
                    (res) => {
                        const r = res as unknown as ResponseDataType;
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
        handler: async ({ type, slug: cmsIdOrSlug }) => {
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
    game,
    series,
    number,
    release
`
                  : ``
}
}`,
                        (res) => {
                            const r = res[0];
                            if (r.logo) r.logo = transformImagePath(r.logo);
                            return [r];
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
                };
            } catch (err) {
                actionErrorHandler(err);
            }
        },
    }),

    videoListPageFetchTags: defineAction({
        input: z.object({
            type: z.string().optional(),
        }) as z.ZodType<{
            type?: VideoListPageTypesType;
        }>,
        handler: async ({ type }) => {
            try {
                const currentType = !type
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
                }>(`
*[_type == "${currentType}"] | order(${
                    currentType === "tag"
                        ? `sort asc`
                        : type === "aerodrome"
                          ? "icao asc"
                          : type === "aircraftFamily"
                            ? "maker->icao_code asc, name asc"
                            : type === "developer"
                              ? "name asc"
                              : type === "platform"
                                ? "name_full asc"
                                : type === "platformUpdate"
                                  ? "release desc"
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
    game,
    series,
    number,
    release,`
                      : ""
    }
}
                `);
            } catch (err) {
                actionErrorHandler(err);
            }
        },
    }),
};

export default actions;
