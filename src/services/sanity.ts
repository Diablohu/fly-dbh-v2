import { createClient, type SanityDocument } from "@sanity/client";
import { defaultCacheMaxAge, defaultCacheStaleWhileRevalidate } from "@/global";
import sanityCache, { getCacheKey } from "./sanity-cache";

// console.log({ "import.meta.env": import.meta.env, "process.env": process.env });
// ============================================================================

export const client = createClient({
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET,
    // useCdn: false, // for static builds
    useCdn: true,
    // Set default headers to be included with all requests
    // headers: {
    //     "X-Custom-Header": "custom-value",
    // },
    apiVersion: "2025-06-18", // use current date (YYYY-MM-DD) to target the latest API version. Note: this should always be hard coded. Setting API version based on a dynamic value (e.g. new Date()) may break your application at a random point in the future.
    // token: import.meta.env.SANITY_SECRET_TOKEN // Needed for certain operations like updating content, accessing drafts or using draft perspectives
});

// ============================================================================

export const fetch = async <
    T extends Record<string, any> = Record<string, any>,
>(
    queryString: string,
    options: {
        transform?: (
            res: SanityDocument<T>[],
            query: string,
        ) => SanityDocument<T>[];
        cache?: {
            id?: Parameters<typeof getCacheKey>[0];
            maxAge?: number;
            staleWhileRevalidate?: number;
        };
    } = {},
) => {
    const key =
        (typeof options.cache?.id !== "undefined"
            ? getCacheKey(options.cache.id)
            : undefined) ?? `SANITY:${queryString}`;

    return await sanityCache.wrap(
        // cache id
        key,

        // cache data
        async () => {
            const posts = await client.fetch<SanityDocument<T>[]>(queryString);

            if (typeof options?.transform === "function")
                return options.transform(posts, queryString);

            return posts;
        },

        // ttl
        options.cache?.maxAge && options.cache?.staleWhileRevalidate
            ? options.cache.maxAge + options.cache.staleWhileRevalidate
            : options.cache?.maxAge
              ? options.cache.maxAge + defaultCacheStaleWhileRevalidate
              : options.cache?.staleWhileRevalidate
                ? defaultCacheMaxAge + options.cache.staleWhileRevalidate
                : undefined,

        // refreshThreshold
        options.cache?.staleWhileRevalidate,
    );
};
