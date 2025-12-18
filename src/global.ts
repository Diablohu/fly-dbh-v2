import {
    type ValidVideoSourceType,
    type ValidContentListAutoLoadMoreType,
    type VideoListPageTypesType,
    type ChallengeDifficultyType,
    type AircraftCategoryType,
} from "@/types";

export const themeColorLight = "#ffffff";
export const themeColorDark = "#0f0f0f";

export const title = "FLY-DBH.com";
export const slogan = "假飞机驾驶员";

export const isUnderConstruction = false;

export const urlPrefixSanityImageCdn = import.meta.env.DEV
    ? typeof process === "object" &&
      process?.env?.FLYDBH_ASSETS_SERVER === "local"
        ? "http://127.0.0.1:8081/images"
        : `/sanity-images`
    : "https://assets.fly-dbh.com/images";
// export const urlPrefixSanityImageCdn = `https://assets.fly-dbh.com/images`;
// export const urlPrefixSanityImageCdn = `http://127.0.0.1:8081/images`;

/** 隶属于某个主分类（`tag_type` === 'category'）的标签（tag） */
export const level2Tags: { [key: string]: string[] } = {
    // news: [
    //     "featured", // 专题报道
    //     "preview", // 前瞻
    // ],
    tutorial: [
        "flightsim-basics", // 模拟入门
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

export const htmlAttributeImageViewer = "data-image-viewer";

// ============================================================================

export const routeBase = {
    home: "/",
    videoList: "/videos",
    watch: "/watch",
    live: "/live",
    challenges: "/challenges",
    flightseeing: "/flightseeing",
    donate: "/donate",
    search: "/search",
};
export function getVideoListPageLink(
    type?: VideoListPageTypesType,
    slug?: string,
    extra?: {
        type: VideoListPageTypesType;
        slug: string;
    }[]
) {
    if (!type) return routeBase.videoList;
    if (!slug) return routeBase.videoList;
    const getTypeString = (type: VideoListPageTypesType) =>
        type === "aircraftFamily"
            ? "aircraftfamily"
            : type === "aircraftOnboardDevice"
              ? "aircraftonboarddevice"
              : type === "platformUpdate"
                ? "platformupdate"
                : type;
    return (
        routeBase.videoList +
        `/${getTypeString(type)}-${slug}` +
        (Array.isArray(extra)
            ? extra
                  .map(({ type, slug }) => `/${getTypeString(type)}-${slug}`)
                  .join("")
            : "")
    );
}
export function getVideoPageLink(slug: string) {
    return `${routeBase.watch}/${slug}`;
}

// ============================================================================

export const navLinks = [
    {
        key: "home",
        route: routeBase.home,
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
              key: "live",
              route: routeBase.live,
              name: "直播",
              icon: "",
              extraChecks: [/^\/vod\//],
          }
        : null,
    {
        key: "challenges",
        route: routeBase.challenges,
        name: import.meta.env.DEV ? "挑战" : "着陆挑战",
        icon: "",
    },
    // import.meta.env.DEV
    //     ? {
    //           key: "activities",
    //           route: "/activities",
    //           name: "活动",
    //           icon: "",
    //       }
    //     : null,
    import.meta.env.DEV
        ? {
              key: "flightseeing",
              route: routeBase.flightseeing,
              name: "云旅游",
              icon: "",
          }
        : null,
    // import.meta.env.DEV
    //     ? {
    //           key: "donate",
    //           route: routeBase.donate,
    //           name: "资助",
    //           icon: "",
    //       }
    //     : null,
].filter((v) => !!v) as {
    key: "home" | "videos" | "live" | "activities" | "challenges" | "donate";
    route: string;
    name: string;
    icon: string;
    extraChecks?: RegExp[];
}[];

export const defaultVideoSource: ValidVideoSourceType = "bilibili";
export const defaultContentListAutoLoadMore: ValidContentListAutoLoadMoreType =
    "1";
export const extraAviationKnowledgeTitle = "相关航空知识";
export const commonAircraftNameSuffix = ["ceo", "neo", "max", "ng"];

// ============================================================================
//
// #region 缓存相关
// 详见 `@/src/services/_cache.ts`
//
// ============================================================================

export const defaultCacheTtl = 60 * 60_1000; // 1 hour
export const defaultCacheRefreshThreshold =
    defaultCacheTtl -
    (import.meta.env.DEV
        ? 5_000 // elapsed: 5 seconds
        : 5 * 60_000); // elapsed: 5 minutes

// #endregion
// ============================================================================
// 
// #region 着陆挑战相关
// 
// ============================================================================

export const challengeDifficultyString: Record<
    ChallengeDifficultyType,
    string
> = {
    1: "小有挑战",
    3: "相当挑战",
    5: "极限挑战",
    7: "R.I.P.",
};

export const aircraftCategoryTypeString: Record<AircraftCategoryType, string> =
    {
        a: "轻小型飞机 & 短距起降",
        b: "支线客机 & 高档私人机",
        c: "干线客机 & 商务喷气机",
        d: "重型喷气机",
    };

// #endregion
