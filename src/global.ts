export const themeColorLight = "#ffffff";
export const themeColorDark = "#0f0f0f";

export const title = "FLY-DBH.com";
export const slogan = "假飞机驾驶员";

export const routeNameSanityImageCdn = `/sanity-images`;

export const navLinks = [
    ["/", "首页", ""],
    import.meta.env.DEV ? ["/videos", "视频"] : ["/videos", "模拟飞行视频"],
    import.meta.env.DEV ? ["/streams", "直播"] : null,
    import.meta.env.DEV ? ["/activities", "活动"] : null,
    import.meta.env.DEV ? ["/about", "联系"] : null,
].filter(Array.isArray);

export const isUnderConstruction = true;
