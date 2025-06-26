import {
    type ValidVideoSourceType,
    type ValidContentListAutoLoadMoreType,
} from "@/types";

export const themeColorLight = "#ffffff";
export const themeColorDark = "#0f0f0f";

export const title = "FLY-DBH.com";
export const slogan = "假飞机驾驶员";

export const isUnderConstruction = true;

export const routeNameSanityImageCdn = `/sanity-images`;

export const navLinks = [
    {
        key: "home",
        route: "/",
        name: "首页",
        icon: "",
    },
    {
        key: "videos",
        route: "/videos",
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
