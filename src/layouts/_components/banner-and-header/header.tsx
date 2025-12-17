import { memo, type FC } from "react";
import classNames from "classnames";

import isRouteActive from "@/utils/is-route-active";
import { navLinks } from "@/global";
import HeaderOptions from "./header-options";
import { type Props } from "./";

import styles from "./index.module.less";

// ============================================================================

const Header: FC<
    Pick<Props, "header" | "logo" | "originPathname" | "defaults">
> = ({ header, logo, originPathname, defaults }) => {
    if (!header) return null;
    return (
        <>
            <header
                className={classNames([
                    styles["header"],
                    {
                        [styles["mod-hidden"]]: !header,
                        [styles[`mod-mode-${import.meta.env.MODE}`]]:
                            import.meta.env.MODE !== "production",
                    },
                ])}
            >
                <section className={styles["wrapper"]}>
                    <section
                        className={classNames([
                            styles["aside"],
                            styles["logo"],
                        ])}
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
                        className={classNames([
                            styles["aside"],
                            styles["right"],
                        ])}
                    >
                        <HeaderOptions
                            defaults={defaults}
                            originPathname={originPathname}
                        />
                    </section>
                </section>
            </header>
            {/* <div className={styles["header-glossy-mask"]} /> */}
        </>
    );
};

export default memo(Header);

/* TODO: Header Mask
	mask for bottom gradient
	extend via css variables
*/
