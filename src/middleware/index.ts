import { defineMiddleware } from "astro:middleware";
import { VIDEO_SOURCE } from "@/constants/cookie-names";
import { defaultVideoSource } from "@/global";

// `context` and `next` are automatically typed
export const onRequest = defineMiddleware((context, next) => {
    // context.re
    if (/^\/api\//.test(context.url.pathname)) return next();

    // 为页面请求设置初始 Cookie 值
    for (const [name, value] of [[VIDEO_SOURCE, defaultVideoSource]]) {
        if (context.cookies.has(VIDEO_SOURCE)) continue;
        context.cookies.set(VIDEO_SOURCE, defaultVideoSource, {
            path: "/",
        });
    }

    // return a Response or the result of calling `next()`
    return next();
});
