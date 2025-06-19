import { memo, type FC, type ReactNode } from "react";
import { type ValidVideoSourceType } from "@/types";

import iconBilibili from "@/assets/icon-bilibili.svg?raw";
import iconYouTube from "@/assets/icon-youtube.svg?raw";
import iconTiktok from "@/assets/icon-tiktok.svg?raw";
import iconKook from "@/assets/icon-kook.svg?raw";

import Banner from "./banner";
import Header from "./header";

// ============================================================================

export const links: {
    name: string;
    title: string;
    href: string;
    iconType?: "svg" | "png";
    iconHtml?: string;
}[] = [
    {
        name: "bilibili",
        title: "哔哩哔哩",
        href: "https://b.fly-dbh.com",
        iconType: "svg",
        iconHtml: iconBilibili,
    },
    {
        name: "youtube",
        title: "YouTube",
        href: "https://ytb.fly-dbh.com",
        iconType: "svg",
        iconHtml: iconYouTube,
    },
    {
        name: "douyin",
        title: "抖音",
        href: "https://douyin.fly-dbh.com",
        iconType: "svg",
        iconHtml: iconTiktok,
    },
    { name: "live", title: "直播间", href: "https://live.fly-dbh.com" },
    {
        name: "qun",
        title: "粉丝群",
        href: "https://qun.fly-dbh.com",
        iconType: "svg",
        iconHtml: iconKook,
    },
];
export type Props = {
    showBanner: boolean;
    showHeader: boolean;
    logo?: ReactNode;
    originPathname: string;
    selectedVideoSource: ValidVideoSourceType;
};

// ============================================================================

const BannerAndHeader: FC<Props> = ({
    showHeader = false,
    showBanner = false,
    logo,
    originPathname,
    selectedVideoSource,
}) => {
    return (
        <>
            <Banner showBanner={showBanner} logo={logo} />
            <Header
                showHeader={showHeader}
                logo={logo}
                originPathname={originPathname}
                selectedVideoSource={selectedVideoSource}
            />
        </>
    );
};

export default memo(BannerAndHeader);
