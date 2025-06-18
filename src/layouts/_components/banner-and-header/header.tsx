import { memo, type FC } from "react";
import classNames from "classnames";

import isRouteActive from "@/utils/is-route-active";
import { navLinks } from "@/global";
import { links, type Props } from "./";

import styles from "./index.module.less";

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
                <section
                    className={classNames([styles["aside"], styles["logo"]])}
                >
                    <a href="/">{logo}</a>
                </section>
                <nav className={styles["nav"]}>
                    {navLinks.map(([route, name]) => (
                        <a
                            key={route}
                            href={route}
                            className={classNames([
                                styles["link"],
                                {
                                    [styles["is-active"]]: isRouteActive(
                                        route,
                                        originPathname
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
