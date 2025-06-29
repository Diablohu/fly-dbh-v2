import {
    type ValidVideoSourceType,
    type ValidContentListAutoLoadMoreType,
} from "@/types";
import getVideoListPageLink from "@/utils/get-video-list-page-link";

export const themeColorLight = "#ffffff";
export const themeColorDark = "#0f0f0f";

export const title = "FLY-DBH.com";
export const slogan = "假飞机驾驶员";

export const isUnderConstruction = false;

export const routeNameSanityImageCdn = `/sanity-images`;

/** 隶属于某个主分类（`tag_type` === 'category'）的标签（tag） */
export const level2Tags: { [key: string]: string[] } = {
    // news: [
    //     "featured", // 专题报道
    //     "preview", // 前瞻
    // ],
    tutorial: [
        "tutorial-aircraft", // 机型操作
        "tutorial-avionics", // 通用航电
        "game-guide", // 攻略技巧
        "aviation-knowledge", // 航空知识
    ],
};
export const allLevel2Tags = Object.values(level2Tags).flat();
export const level2TagsMap = Object.entries(level2Tags).reduce<{
    [key: string]: string;
}>((map, [level1, tags]) => {
    tags.forEach((level2) => {
        map[level2] = level1;
    });
    return map;
}, {});

export const navLinks = [
    {
        key: "home",
        route: "/",
        name: "首页",
        icon: "",
    },
    {
        key: "videos",
        route: getVideoListPageLink(),
        name: import.meta.env.DEV ? "视频" : "模拟飞行视频",
        icon: "",
        extraChecks: [/^\/watch\//],
    },
    import.meta.env.DEV
        ? {
              key: "streams",
              route: "/streams",
              name: "直播",
              icon: "",
              extraChecks: [/^\/vod\//],
          }
        : null,
    import.meta.env.DEV
        ? {
              key: "activities",
              route: "/activities",
              name: "活动",
              icon: "",
          }
        : null,
    import.meta.env.DEV
        ? {
              key: "donate",
              route: "/donate",
              name: "资助",
              icon: "",
          }
        : null,
].filter((v) => !!v) as {
    key: "home" | "videos" | "streams" | "activities" | "donate";
    route: string;
    name: string;
    icon: string;
    extraChecks?: RegExp[];
}[];

export const defaultVideoSource: ValidVideoSourceType = "bilibili";
export const defaultContentListAutoLoadMore: ValidContentListAutoLoadMoreType =
    "1";

// ============================================================================
//
// 缓存相关
// 详见 `@/src/services/_cache.ts`
//
// ============================================================================

export const defaultCacheTtl = import.meta.env.DEV ? 10_000 : 600_000;
export const defaultCacheRefreshThreshold = import.meta.env.DEV
    ? 5_000
    : 60_000;
