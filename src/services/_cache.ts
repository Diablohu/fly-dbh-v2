import { createCache } from "cache-manager";

const cache = createCache({
    /**
     * 缓存的内容存活有这个时长后，才会被更新
     * - 单位 `毫秒`
     */
    ttl: import.meta.env.DEV ? 10_000 : 600_000,
    refreshThreshold: import.meta.env.DEV ? 5_000 : 60_000, // milliseconds
    nonBlocking: true,
});

export default cache;
