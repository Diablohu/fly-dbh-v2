import { defineAction } from "astro:actions";
import { fetch } from "@/services/sanity";
import { resolveAssetPath } from "@/services/sanity-helpers";
import { type HomeVideoDocumentType, type HomeCollectionsType } from "@/types";
import actionErrorHandler from "./_error-handler";
import { getGroqLatestChallenges } from "./challenge";
import getGroqFilterVideo from "@/utils/groq/get-filter-video";

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
    links,
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

type FilterType = "first-tag" | "contain";

const getFilterTag = (tagSlug: string, type: FilterType) =>
    type === "first-tag"
        ? `"${tagSlug}" == tags[0]->slug.current`
        : `"${tagSlug}" in tags[]->slug.current`;

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
    ] as Array<
        | [string, string | string[]]
        | [
              string,
              string | string[],
              {
                  count?: number;
                  filterType?: FilterType;
              },
          ]
    >
)
    .map(([name, tagSlug, options]) => {
        const count = options?.count ?? 10;
        const filterType = options?.filterType ?? "first-tag";
        /*
            ONLY FIRST TAG
                "${s}" == tags[0]->slug.current
            CONTAIN ONE TAG
                "${s}" in tags[]->slug.current
        */
        return `'${name}': ${getGroqFilterVideo(
            Array.isArray(tagSlug)
                ? ` && (${tagSlug
                      .map((s) => getFilterTag(s, filterType))
                      .join(" || ")})`
                : tagSlug
                  ? ` && ${getFilterTag(tagSlug, filterType)}`
                  : "",
        )} ${fetchSorting} ${getProjections(name)} [0...${count}]`;
    })
    .join(",")},
    'config': *[_id == 'db0caed0-d756-4162-953b-f96a65a731e9']{config[]{key,'value':value.code}},
    'challenges': ${getGroqLatestChallenges(10)}
}`,
                    {
                        transform: (res) => {
                            return Object.entries(
                                res as unknown as HomeCollectionsType,
                            ).reduce<HomeCollectionsType>(
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
                                        case "challenges": {
                                            collections.challenges =
                                                posts as HomeCollectionsType["challenges"];
                                            /*.map((post) => {
                                                if (post.aerodrome.photo)
                                                    post.aerodrome.photo =
                                                        transformImagePath(
                                                            post.aerodrome.photo
                                                        );
                                                return post;
                                            });*/
                                            break;
                                        }
                                        default: {
                                            collections[collection] = (
                                                posts as HomeVideoDocumentType[]
                                            ).map(({ cover, ...post }) => ({
                                                cover: resolveAssetPath(cover),
                                                ...post,
                                            }));
                                        }
                                    }
                                    return collections;
                                },
                                { config: [], challenges: [] },
                            ) as unknown as HomeVideoDocumentType[];
                        },
                        cache: {
                            key: ["home-page"],
                        },
                    },
                )) as unknown as HomeCollectionsType;
            } catch (err) {
                actionErrorHandler(err);
            }
        },
    }),
};

export default actions;
