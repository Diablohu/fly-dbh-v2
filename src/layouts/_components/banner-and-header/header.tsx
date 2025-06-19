import { memo, useCallback, type FC } from "react";
import classNames from "classnames";
import { type ValidVideoSourceType } from "@/types";

import useVideoSource from "@/react-hooks/use-video-source";
import isRouteActive from "@/utils/is-route-active";
import { navLinks } from "@/global";
import { links, type Props } from "./";

import styles from "./index.module.less";

// ============================================================================

const Header: FC<
    Pick<
        Props,
        "showHeader" | "logo" | "originPathname" | "selectedVideoSource"
    >
> = ({ showHeader, logo, originPathname, selectedVideoSource }) => {
    return (
        <header
            className={classNames([
                styles["header"],
                {
                    [styles["mod-hidden"]]: !showHeader,
                },
            ])}
        >
            <section className={styles["wrapper"]}>
                <section
                    className={classNames([styles["aside"], styles["logo"]])}
                >
                    <a href="/">{logo}</a>
                </section>
                <nav className={styles["nav"]}>
                    {navLinks.map(({ route, name, extraChecks }) => (
                        <a
                            key={route}
                            href={route}
                            className={classNames([
                                styles["link"],
                                {
                                    [styles["is-active"]]: isRouteActive(
                                        route,
                                        originPathname,
                                        extraChecks
                                    ),
                                },
                            ])}
                        >
                            {name}
                        </a>
                    ))}
                </nav>
                <section
                    className={classNames([styles["aside"], styles["options"]])}
                >
                    <section className={styles["switch-video-source"]}>
                        {links
                            .filter(({ name }) =>
                                ["bilibili", "youtube", "douyin"].includes(name)
                            )
                            .map(({ name, title, iconType, iconHtml }) => (
                                <VideoSourceSwitchItem
                                    key={name}
                                    name={name as ValidVideoSourceType}
                                    title={title}
                                    iconType={iconType}
                                    iconHtml={iconHtml}
                                    selectedVideoSource={selectedVideoSource}
                                />
                            ))}
                    </section>
                    {/* TODO: 视频源改为下拉菜单内容，菜单中还包括亮暗切换 */}
                </section>
            </section>
        </header>
    );
};

export default memo(Header);

// ============================================================================

const VideoSourceSwitchItem: FC<{
    name: ValidVideoSourceType;
    title: string;
    iconType?: "png" | "svg";
    iconHtml?: string;
    selectedVideoSource: ValidVideoSourceType;
}> = memo(({ name, title, iconType, iconHtml = "", selectedVideoSource }) => {
    const [$videoSource, setVideoSource] = useVideoSource(selectedVideoSource);
    const onClick = useCallback(() => {
        setVideoSource(name);
    }, [setVideoSource]);

    return (
        <button
            type="button"
            className={classNames([
                styles["video-source-switch-item"],
                styles[`video-source-switch-item-${name}`],
                {
                    [styles["is-active"]]: name === $videoSource,
                },
            ])}
            title={title}
            dangerouslySetInnerHTML={{
                __html:
                    iconType === "png"
                        ? `<img src="${iconHtml}" alt="${title}" />`
                        : iconType === "svg"
                          ? iconHtml
                          : "",
            }}
            onClick={onClick}
        ></button>
    );
});
