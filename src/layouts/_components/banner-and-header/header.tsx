import { memo, type FC } from "react";
import classNames from "classnames";

import styles from "./index.module.less";

import { links, type Props } from "./";

// ============================================================================

const Header: FC<Pick<Props, "showHeader" | "logo" | "originPathname">> = ({
    showHeader,
    logo,
    originPathname,
}) => {
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
                <a
                    href="/"
                    className={classNames([
                        styles["aside"],
                        styles["link-home"],
                    ])}
                >
                    {logo}
                </a>
                <nav className={styles["nav"]}>
                    {[
                        ["/", "首页"],
                        ["/videos", "模拟飞行视频"],
                        ["/streams", "直播回放"],
                        // ["/clips", "直播切片"],
                        // ["/about", "关于 & 联系"],
                    ].map(([route, name]) => (
                        <a
                            key={route}
                            href={route}
                            className={classNames([
                                styles["link"],
                                {
                                    [styles["is-active"]]:
                                        originPathname === route,
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
                    {links
                        .filter((link) => Boolean(link[4]))
                        .map(([name, title, href, iconType, icon]) => (
                            <a
                                key={name}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={classNames([
                                    styles["link"],
                                    styles[`link-${name}`],
                                ])}
                                title={title}
                                dangerouslySetInnerHTML={{
                                    __html:
                                        iconType === "png"
                                            ? `<img src="${icon}" alt="${title}" />`
                                            : iconType === "svg"
                                              ? icon
                                              : "",
                                }}
                            ></a>
                        ))}
                    {/* TODO: Light / Dark */}
                </section>
            </section>
        </header>
    );
};

export default memo(Header);
