import { type ValidVideoSourceType } from "@/types";

import iconBilibili from "@/assets/icon-bilibili.svg?raw";
import iconYouTube from "@/assets/icon-youtube.svg?raw";
import iconTiktok from "@/assets/icon-tiktok.svg?raw";

import getPlatformName from "@/utils/get-platform-name";

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
        iconHtml: iconBilibili,
    },
    {
        name: "youtube",
        title: getPlatformName("youtube"),
        href: "https://ytb.fly-dbh.com",
        iconType: "svg",
        iconHtml: iconYouTube,
    },
    {
        name: "douyin",
        title: getPlatformName("douyin"),
        href: "https://douyin.fly-dbh.com",
        iconType: "svg",
        iconHtml: iconTiktok,
    },
];

export default videoPlatforms;
