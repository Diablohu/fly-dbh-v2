import { createCache } from "cache-manager";
import debug from "debug";
import { defaultCacheMaxAge, defaultCacheStaleWhileRevalidate } from "@/global";

const log = debug("Sanity Cache");
log.namespace = "Sanity Cache";
log.enabled = true;

const cache = createCache({
    cacheId: "sanity-request",
    /**
     * 缓存存活的最长时间
     *  - 只有超过这个时长才会被清理
     *  - 单位 `毫秒`
     */
    ttl: defaultCacheMaxAge + defaultCacheStaleWhileRevalidate,
    /**
     * 刷新缓存值的阈值时间
     *  - 单位 `毫秒`
     *  - 当缓存的 `ttl` 剩余时间小于这个数值时，刷新缓存
     *  - 刷新时，会优先返回缓存的结果，之后根据请求返回值刷新缓存
     *  - 如此，该次的用户请求仍为旧的缓存结果，之后的请求会变为新的缓存结果
     */
    refreshThreshold: defaultCacheStaleWhileRevalidate,
    /**
     * 该选项决定了，需要刷新缓存时，是否优先返回已有的缓存结果
     */
    nonBlocking: true,
});

cache.on("del", ({ key, error }) => {
    log(`Removing "${key}"`);
    if (error) log(`^^ Error ^^ ${error}`);
});
// cache.on("set", ({ key, error }) => {
//     log(`Storing ${key}: ${error ?? "Done"}`);
// });
cache.on("refresh", ({ key, error }) => {
    log(`Revalidating "${key}"`);
    if (error) log(`^^ Error ^^ ${error}`);
});

// console.log({
//     /**
//      * 缓存存活的最长时间
//      *  - 只有超过这个时长才会被清理
//      *  - 单位 `毫秒`
//      */
//     ttl: defaultCacheMaxAge + defaultCacheStaleWhileRevalidate,
//     /**
//      * 刷新缓存值的阈值时间
//      *  - 单位 `毫秒`
//      *  - 当缓存的 `ttl` 剩余时间小于这个数值时，刷新缓存
//      *  - 刷新时，会优先返回缓存的结果，之后根据请求返回值刷新缓存
//      *  - 如此，该次的用户请求仍为旧的缓存结果，之后的请求会变为新的缓存结果
//      */
//     refreshThreshold: defaultCacheStaleWhileRevalidate,
//     /**
//      * 该选项决定了，需要刷新缓存时，是否优先返回已有的缓存结果
//      */
//     nonBlocking: true,
// });

export default cache;

// ============================================================================

export const getCacheKey = (
    input:
        | string
        | ["home-page"]
        | ["video-details", string]
        | ["video-list", string, { from: number; length: number }]
        | ["video-list-info", string]
        | ["video-tag-list", string]
        | ["challenges-details", string]
        | ["challenges-catalog", string, { from: number; length: number }]
        | ["challenges-random", string, { index: number }]
        | ["challenges-random-count"]
        | ["challenges-hazard-list"]
        | ["search", string, { from: number; length: number }]
        | ["rss-feed"]
        | ["sitemap", string],
) =>
    typeof input === "string"
        ? input
        : Array.isArray(input)
          ? input
                .map((segment) =>
                    typeof segment === "object"
                        ? JSON.stringify(segment)
                        : segment,
                )
                .join(":")
          : undefined;
