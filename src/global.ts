import { type ValidVideoSourceType } from "@/types";

export const themeColorLight = "#ffffff";
export const themeColorDark = "#0f0f0f";

export const title = "FLY-DBH.com";
export const slogan = "假飞机驾驶员";

export const isUnderConstruction = true;

export const routeNameSanityImageCdn = `/sanity-images`;

export const navLinks = [
    {
        route: "/",
        name: "首页",
        icon: "",
    },
    {
        route: "videos",
        name: import.meta.env.DEV ? "视频" : "模拟飞行视频",
        icon: "",
        extraChecks: [/^\/watch\//],
    },
    import.meta.env.DEV
        ? {
              route: "/streams",
              name: "直播",
              icon: "",
              extraChecks: [/^\/vod\//],
          }
        : null,
    import.meta.env.DEV
        ? {
              route: "/activities",
              name: "活动",
              icon: "",
          }
        : null,
    import.meta.env.DEV
        ? {
              route: "/about",
              name: "联系",
              icon: "",
          }
        : null,
].filter<{
    route: string;
    name: string;
    icon: string;
    extraChecks?: RegExp[];
}>((v) => !!v);

export const defaultVideoSource: ValidVideoSourceType = "bilibili";
