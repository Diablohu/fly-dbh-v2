import { defineMiddleware } from "astro:middleware";
// import { getActionContext } from "astro:actions";
import {
    VIDEO_SOURCE,
    CONTENT_LIST_AUTO_LOAD_MORE,
    getGeneralOptions as getGeneralCookieOptions,
} from "@/constants/cookies";
import { defaultVideoSource, defaultContentListAutoLoadMore } from "@/global";

export const onRequest = defineMiddleware((context, next) => {
    // 如果请求 URL 以 `/api/` 开头，不进行后续检查
    if (/^\/api\//.test(context.url.pathname)) return next();

    // 获取 Astro _Action_ 信息
    // const { action } = getActionContext(context);
    // 如果请求是 _Action_
    // if (action) {
    // console.log({ action });
    // return next();
    // }

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
