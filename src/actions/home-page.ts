import type { SanityDocument } from "@sanity/client";
import { defineAction, ActionError } from "astro:actions";
import { fetch } from "@/services/sanity";
import { transformImagePath } from "@/utils/sanity-helpers";

const fetchSorting = ` | order( release desc )`;
const fetchProjections = `{
    _id,
    title,
    'tags': tags[]->{
        "value": name,
        "label": title
    },
    release,
    "cover": cover.asset->path + '?auto=format&w=400&q=65',
}`;
// links

type CollectionsType = {
    [collection: string]: SanityDocument<{
        _id: string;
        title: string;
        tags: { value: string; label: string }[];
        release: string;
        cover: string;
    }>[];
};

const actions = {
    homePageFetch: defineAction({
        handler: async () => {
            try {
                return Object.entries(
                    (await fetch(`{
${[
    ["latest", "", 9],
    ["tutorialsAircraft", "aircraft"],
    ["tutorialsTips", "tip"],
    ["tutorialsAviation", "aviation"],
    ["news", "news"],
    ["reviews", "benchmark"],
    ["world", "world"],
]
    .map(
        ([name, tagName, count = 3]) =>
            `'${name}': *[_type == "video"${
                tagName ? ` && "${tagName}" in tags[]->name` : ""
            }] ${fetchSorting} ${fetchProjections} [0...${count}]`
    )
    .join(",")}
}`)) as unknown as CollectionsType
                ).reduce<CollectionsType>(
                    (collections, [collection, posts]) => {
                        collections[collection] = posts.map(
                            ({ cover, ...post }) => ({
                                cover: transformImagePath(cover),
                                ...post,
                            })
                        );
                        return collections;
                    },
                    {}
                );
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
