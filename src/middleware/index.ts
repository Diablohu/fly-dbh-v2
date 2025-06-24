import { defineMiddleware } from "astro:middleware";
import {
    VIDEO_SOURCE,
    CONTENT_LIST_AUTO_LOAD_MORE,
    getGeneralOptions as getGeneralCookieOptions,
} from "@/constants/cookies";
import { defaultVideoSource, defaultContentListAutoLoadMore } from "@/global";

// `context` and `next` are automatically typed
export const onRequest = defineMiddleware((context, next) => {
    // context.re
    if (/^\/api\//.test(context.url.pathname)) return next();

    // 为页面请求设置初始 Cookie 值
    for (const [name, defaultValue] of [
        [VIDEO_SOURCE, defaultVideoSource],
        [CONTENT_LIST_AUTO_LOAD_MORE, defaultContentListAutoLoadMore],
    ]) {
        // console.log(getSetVideoSourceOptions());
        if (context.cookies.has(name)) continue;
        context.cookies.set(name, defaultValue, getGeneralCookieOptions());
    }

    // return a Response or the result of calling `next()`
    return next();
});
