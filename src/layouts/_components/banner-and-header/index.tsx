import { memo, type FC, type ReactNode } from "react";
import {
    type ValidVideoSourceType,
    type ValidColorSchemeType,
    type ValidContentListAutoLoadMoreType,
} from "@/types";

import videoPlatforms from "@/constants/video-platforms";

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
    ...videoPlatforms,
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
        videoSource: ValidVideoSourceType;
        forcedColorScheme?: ValidColorSchemeType;
        contentListAutoLoadMore: ValidContentListAutoLoadMoreType;
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
