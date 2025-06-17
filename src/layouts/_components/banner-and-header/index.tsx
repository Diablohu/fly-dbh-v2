import { memo, type FC, type ReactNode } from "react";

import iconBilibili from "@/assets/icon-bilibili.svg?raw";
import iconYouTube from "@/assets/icon-youtube.svg?raw";
import iconTiktok from "@/assets/icon-tiktok.svg?raw";
import iconKook from "@/assets/icon-kook.svg?raw";

import Banner from "./banner";
import Header from "./header";

// import styles from "./index.module.less";

// ============================================================================

export const links = [
    ["bilibili", "哔哩哔哩", "https://b.fly-dbh.com", "svg", iconBilibili],
    ["youtube", "YouTube", "https://ytb.fly-dbh.com", "svg", iconYouTube],
    ["douyin", "抖音", "https://douyin.fly-dbh.com", "svg", iconTiktok],
    ["live", "直播间", "https://live.fly-dbh.com"],
    ["qun", "粉丝群", "https://qun.fly-dbh.com", "svg", iconKook],
];
export type Props = {
    showBanner?: boolean;
    showHeader?: boolean;
    logo?: ReactNode;
    originPathname: string;
};

// ============================================================================

const BannerAndHeader: FC<Props> = ({
    showHeader = false,
    showBanner = false,
    logo,
    originPathname,
}) => {
    return (
        <>
            <Banner showBanner={showBanner} logo={logo} />
            <Header
                showHeader={showHeader}
                logo={logo}
                originPathname={originPathname}
            />
            {/* TODO: TAB BAR on PHONE VIEW */}
        </>
    );
};

export default memo(BannerAndHeader);
