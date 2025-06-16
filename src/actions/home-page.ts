import type { SanityDocument } from "@sanity/client";
import { defineAction, ActionError } from "astro:actions";
import { routeNameSanityImageCdn } from "@/global";
import { fetch } from "@/services/sanity";

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
'latest': *[_type == "video"] ${fetchSorting} ${fetchProjections} [0...5],
'tutorialsAircraft': *[_type == "video" && "aircraft" in tags[]->name] ${fetchSorting} ${fetchProjections} [0...3],
'tutorialsTips': *[_type == "video" && "tip" in tags[]->name] ${fetchSorting} ${fetchProjections} [0...3],
'tutorialsAviation': *[_type == "video" && "aviation" in tags[]->name] ${fetchSorting} ${fetchProjections} [0...3],
'news': *[_type == "video" && "news" in tags[]->name] ${fetchSorting} ${fetchProjections} [0...3],
'reviews': *[_type == "video" && "benchmark" in tags[]->name] ${fetchSorting} ${fetchProjections} [0...3],
'world': *[_type == "video" && "world" in tags[]->name] ${fetchSorting} ${fetchProjections} [0...3]
}`)) as unknown as CollectionsType
                ).reduce<CollectionsType>(
                    (collections, [collection, posts]) => {
                        collections[collection] = posts.map(
                            ({ cover, ...post }) => ({
                                cover: `${routeNameSanityImageCdn}${cover.replace(
                                    `images/${process.env.SANITY_PROJECT_ID}/${process.env.SANITY_DATASET}`,
                                    ""
                                )}`,
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
