import { type ValidVideoSourceType } from "@/types";

import getPlatformName from "@/utils/get-platform-name";

function getUseSymbolHtml(name: string) {
    return `<svg fill="currentColor" focusable="false" aria-hidden="true"><use xlink:href="#_g-symbol-${name}"></use></svg>`;
}

export const videoPlatforms: {
    name: ValidVideoSourceType;
    title: string;
    href: string;
    iconType?: "svg" | "png";
    iconHtml?: string;
}[] = [
    {
        name: "bilibili",
        title: getPlatformName("bilibili"),
        href: "https://b.fly-dbh.com",
        iconType: "svg",
        iconHtml: getUseSymbolHtml("bilibili"),
    },
    {
        name: "youtube",
        title: getPlatformName("youtube"),
        href: "https://ytb.fly-dbh.com",
        iconType: "svg",
        iconHtml: getUseSymbolHtml("youtube"),
    },
    {
        name: "douyin",
        title: getPlatformName("douyin"),
        href: "https://douyin.fly-dbh.com",
        iconType: "svg",
        iconHtml: getUseSymbolHtml("tiktok"),
    },
];

export default videoPlatforms;
