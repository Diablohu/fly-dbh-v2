import { memo, type FC, type ReactNode } from "react";
import { type ValidVideoSourceType, type ValidColorSchemeType } from "@/types";

import getPlatformName from "@/utils/get-platform-name";

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
    defaults: {
        selectedVideoSource: ValidVideoSourceType;
        forcedColorScheme?: ValidColorSchemeType;
    };
};

// ============================================================================

const BannerAndHeader: FC<Props> = ({
    showHeader = false,
    showBanner = false,
    logo,
    originPathname,
    defaults,
}) => {
    return (
        <>
            <Banner showBanner={showBanner} logo={logo} />
            <Header
                showHeader={showHeader}
                logo={logo}
                originPathname={originPathname}
                defaults={defaults}
            />
        </>
    );
};

export default memo(BannerAndHeader);
