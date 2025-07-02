import { createCache } from "cache-manager";
import { defaultCacheTtl, defaultCacheRefreshThreshold } from "@/global";

const cache = createCache({
    /**
     * 缓存存活的最长时间
     *  - 只有超过这个时长才会被清理
     *  - 单位 `毫秒`
     */
    ttl: defaultCacheTtl,
    /**
     * 刷新缓存值的阈值时间
     *  - 单位 `毫秒`
     *  - 当缓存的 `ttl` 剩余时间小于这个数值时，刷新缓存
     *  - 刷新时，会优先返回缓存的结果，之后根据请求返回值刷新缓存
     *  - 如此，该次的用户请求仍为旧的缓存结果，之后的请求会变为新的缓存结果
     */
    refreshThreshold: defaultCacheRefreshThreshold, 
    /**
     * 该选项决定了，需要刷新缓存时，是否优先返回已有的缓存结果
     */
    nonBlocking: true,
});

export default cache;
