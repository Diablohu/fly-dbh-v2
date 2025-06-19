import type { SanityDocument } from "@sanity/client";
import { defineAction, ActionError } from "astro:actions";
import { fetch } from "@/services/sanity";
import { transformImagePath } from "@/utils/sanity-helpers";

const fetchSorting = ` | order( release desc )`;
const fetchProjections = `{
    _id,
    'slug': slug.current,
    title,
    'tags': tags[]->{
        "value": name,
        "label": title
    },
    release,
    "cover": cover.asset->path,
}`;
// links

type DocumentType = SanityDocument<{
    _id: string;
    slug?: string;
    title: string;
    tags: { value: string; label: string }[];
    release: string;
    cover: string;
}>;
type CollectionsType = {
    [collection: string]: DocumentType[];
};

const actions = {
    homePageFetch: defineAction({
        handler: async () => {
            try {
                return (await fetch(
                    `{
${[
    ["latest"],
    ["tutorials", "training"],
    ["news", "news"],
    ["reviews", "benchmark"],
    ["world", "world"],
]
    .map(
        ([name, tagName, count = 10]) =>
            `'${name}': *[_type == "video"${
                tagName ? ` && "${tagName}" in tags[]->name` : ""
            }] ${fetchSorting} ${fetchProjections} [0...${count}]`
    )
    .join(",")}
}`,
                    (res) => {
                        return Object.entries(
                            res as unknown as CollectionsType
                        ).reduce<CollectionsType>(
                            (collections, [collection, posts]) => {
                                // console.log(posts[0]);
                                collections[collection] = posts.map(
                                    ({ cover, ...post }) => ({
                                        cover: transformImagePath(cover),
                                        ...post,
                                    })
                                );
                                return collections;
                            },
                            {}
                        ) as unknown as DocumentType[];
                    }
                )) as unknown as CollectionsType;
            } catch (err) {
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
