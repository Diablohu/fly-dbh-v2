import type { SanityDocument } from "@sanity/client";
import { defineAction } from "astro:actions";
import { fetch } from "@/services/sanity";
import { transformImagePath } from "@/utils/sanity-helpers";
import { type VideoItemType, type SiteConfigsType } from "@/types";
import actionErrorHandler from "./_error-handler";

const fetchSorting = ` | order( release desc )`;
const getProjections = (collection: string) => `{
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
    ${
        ["reviews", "preview"].includes(collection)
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
// links

type DocumentType = SanityDocument<
    Partial<VideoItemType> &
        Pick<VideoItemType, "_id" | "title" | "release" | "cover" | "tags">
>;
type CollectionsType = {
    config: SiteConfigsType;
} & {
    [collection: string]: DocumentType[];
};

const actions = {
    fetch: defineAction({
        handler: async () => {
            try {
                return (await fetch(
                    `{
${(
    [
        ["latest"],
        ["featured", "featured"],
        ["tutorials", "tutorial"],
        // ["news", ["news", "preview"]],
        ["reviews", "review"],
        ["preview", "preview"],
        ["world", "world"],
    ] as [string, string | string[]][]
)
    .map(
        ([name, tagSlug, count = 10]) =>
            `'${name}': *[_type == "video"${
                Array.isArray(tagSlug)
                    ? ` && (${tagSlug.map((s) => `"${s}" in tags[]->slug.current`).join(" || ")})`
                    : tagSlug
                      ? ` && "${tagSlug}" in tags[]->slug.current`
                      : ""
            }] ${fetchSorting} ${getProjections(name)} [0...${count}]`
    )
    .join(",")},
'config': *[_id == 'db0caed0-d756-4162-953b-f96a65a731e9']{config[]{key,'value':value.code}},
}`,
                    {
                        transform: (res) => {
                            return Object.entries(
                                res as unknown as CollectionsType
                            ).reduce<CollectionsType>(
                                (collections, [collection, posts]) => {
                                    switch (collection) {
                                        case "config": {
                                            collections[collection] = (
                                                posts[0] as unknown as {
                                                    config: [];
                                                }
                                            ).config;
                                            break;
                                        }
                                        default: {
                                            collections[collection] = (
                                                posts as DocumentType[]
                                            ).map(({ cover, ...post }) => ({
                                                cover: transformImagePath(
                                                    cover
                                                ),
                                                ...post,
                                            }));
                                        }
                                    }
                                    return collections;
                                },
                                { config: [] }
                            ) as unknown as DocumentType[];
                        },
                    }
                )) as unknown as CollectionsType;
            } catch (err) {
                actionErrorHandler(err);
            }
        },
    }),
};

export default actions;
