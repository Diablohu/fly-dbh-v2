import { memo, type FC, type ReactNode } from "react";
import {
    type ValidVideoSourceType,
    type ValidColorSchemeType,
    type ValidContentListAutoLoadMoreType,
    type ValidVideoItemShowPlatformLinksOnHoverType,
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
    ...videoPlatforms.filter(({ name }) =>
        ["bilibili", "youtube", "douyin"].includes(name),
    ),
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
    banner: boolean;
    bannerCoverImage?: string;
    header: boolean;
    logo?: ReactNode;
    originPathname: string;
    defaults: {
        videoSource: ValidVideoSourceType;
        forcedColorScheme?: ValidColorSchemeType;
        contentListAutoLoadMore: ValidContentListAutoLoadMoreType;
        videoItemShowPlatformLinksOnHover?: ValidVideoItemShowPlatformLinksOnHoverType;
    };
};

// ============================================================================

const BannerAndHeader: FC<Props> = ({
    header = false,
    banner = false,
    bannerCoverImage,
    logo,
    originPathname,
    defaults,
}) => {
    return (
        <>
            <Banner banner={banner} coverImage={bannerCoverImage} logo={logo} />
            <Header
                header={header}
                logo={logo}
                originPathname={originPathname}
                defaults={defaults}
            />
        </>
    );
};

export default memo(BannerAndHeader);
