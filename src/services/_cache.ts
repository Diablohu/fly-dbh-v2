import { createCache } from "cache-manager";
import { defaultCacheTtl, defaultCacheRefreshThreshold } from "@/global";

const cache = createCache({
    /**
     * 缓存存活的最长时间
     *  - 超过这个时长才会被更新或清理
     *  - 单位 `毫秒`
     */
    ttl: defaultCacheTtl,
    /**
     * 刷新缓存值的阈值
     *  - 当缓存的 `ttl` 剩余时间小于这个数值时，刷新缓存
     */
    refreshThreshold: defaultCacheRefreshThreshold, // milliseconds
    nonBlocking: true,
});

export default cache;
