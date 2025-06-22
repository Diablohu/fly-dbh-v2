import { memo, type FC } from "react";
import classNames from "classnames";

import isRouteActive from "@/utils/is-route-active";
import { navLinks } from "@/global";
import { type Props } from "./";

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
                    😲
                    {/* TODO: 视频源改为下拉菜单内容，菜单中还包括亮暗切换 */}
                </section>
            </section>
        </header>
    );
};

export default memo(Header);
