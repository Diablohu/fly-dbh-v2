import { defineMiddleware } from "astro:middleware";
import { VIDEO_SOURCE, getGeneralOptions as getGeneralCookieOptions } from "@/constants/cookies";
import { defaultVideoSource } from "@/global";

// `context` and `next` are automatically typed
export const onRequest = defineMiddleware((context, next) => {
    // context.re
    if (/^\/api\//.test(context.url.pathname)) return next();

    // 为页面请求设置初始 Cookie 值
    for (const [name, defaultValue] of [[VIDEO_SOURCE, defaultVideoSource]]) {
        // console.log(getSetVideoSourceOptions());
        if (context.cookies.has(name)) continue;
        context.cookies.set(name, defaultValue, getGeneralCookieOptions());
    }

    // return a Response or the result of calling `next()`
    return next();
});
