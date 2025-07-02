import { memo, type FC } from "react";
import classNames from "classnames";

import isRouteActive from "@/utils/is-route-active";
import { navLinks } from "@/global";
import HeaderOptions from "./header-options";
import { type Props } from "./";

import styles from "./index.module.less";

// ============================================================================

const Header: FC<
    Pick<Props, "showHeader" | "logo" | "originPathname" | "defaults">
> = ({ showHeader, logo, originPathname, defaults }) => {
    if (!showHeader) return null;
    return (
        <header
            className={classNames([
                styles["header"],
                {
                    [styles["mod-hidden"]]: !showHeader,
                    [styles[`mod-mode-${import.meta.env.MODE}`]]:
                        import.meta.env.MODE !== "production",
                },
            ])}
        >
            <section className={styles["wrapper"]}>
                <section
                    className={classNames([styles["aside"], styles["logo"]])}
                >
                    <a href="/" aria-label="FLY-DBH.com">
                        {logo}
                    </a>
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
                    className={classNames([styles["aside"], styles["right"]])}
                >
                    <HeaderOptions defaults={defaults} />
                </section>
            </section>
        </header>
    );
};

export default memo(Header);
