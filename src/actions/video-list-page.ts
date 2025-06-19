import { z } from "astro:schema";
import { defineAction, ActionError } from "astro:actions";
import type { SanityDocument } from "@sanity/client";
import { fetch } from "@/services/sanity";
import { transformImagePath } from "@/utils/sanity-helpers";
import { type VideoListPageTypesType } from "@/types";

const baseProjections = `{
    _id,
    'slug': slug.current,
    title,
    release,
    "cover": cover.asset->path,
}`;
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
const getProjections = (type?: VideoListPageTypesType) => {
    // TODO: projections based on type
    return baseProjections;
};
// const fetchProjections = `{
//     _id,
//     'slug': slug.current,
//     title,
//     'tags': tags[]->{
//         _id,
//         'slug': slug.current,
//         "value": name,
//         "label": title
//     },
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
type VideoItemType = {
    _id: string;
    slug?: string;
    title: string;
    release: string;
    cover: string;
    // description: string;
    // links: {
    //     bilibili: string;
    //     youtube: string;
    //     douyin: string;
    // };

    tags?: {
        _id: string;
        slug?: string;
        value: string;
        label: string;
    }[];
    aircraft_families?: {
        _id: string;
        slug?: string;
        maker: string;
        name: string;
    }[];
    aerodromes?: {
        _id: string;
        slug?: string;
        icao: string;
        iata: string;
        name: string;
    }[];
    developers?: {
        _id: string;
        slug?: string;
        name: string;
    }[];
    games?: {
        _id: string;
        slug?: string;
        name: string;
    }[];
    msfs_updates?: {
        _id: string;
        slug?: string;
        game: string;
        series: string;
        number: number;
        release: string;
    }[];
};
type ResponseDataType = {
    list: VideoItemType[];
    total: number;
    page: number;
};

const actions = {
    videoListPageFetch: defineAction({
        input: z.object({
            type: z.string().optional(),
            slug: z.string().optional(),
            from: z.number().optional(),
            length: z.number().optional(),
        }) as z.ZodType<{
            type?: VideoListPageTypesType;
            slug?: string;
            from?: number;
            length?: number;
        }>,
        handler: async ({ type, slug: cmsIdOrSlug, from = 0, length = 20 }) => {
            try {
                const query = `*[_type == "video"${getFilter(type, cmsIdOrSlug)}] ${getProjections(type)} | order( release desc )`;

                return (await fetch(
                    `{
'list' : ${query} [${from}...${from + length}],
'total' : count(${query}),
}`,
                    (res) => {
                        const r = res as unknown as ResponseDataType;
                        r.list = r.list.map(({ cover, ...post }) => ({
                            cover: transformImagePath(cover),
                            ...post,
                        }));
                        // const maxPage = Math.ceil(r.total / length);
                        // console.log(r.total, from, length, maxPage);
                        r.page = Math.floor(from / length) + 1;
                        return r as unknown as SanityDocument<VideoItemType>[];
                    }
                )) as unknown as ResponseDataType;
            } catch (err) {
                console.trace(err);
                throw new ActionError({
                    message:
                        err instanceof Error ? err.message : (err as string),
                    code: "INTERNAL_SERVER_ERROR",
                });
            }
        },
    }),
};

export default actions;
