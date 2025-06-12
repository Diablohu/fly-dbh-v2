import { useCallback, useState, useRef, useEffect, type FC } from "react";
import classNames from "classnames";

import styles from "./banner-and-header.module.less";

// ============================================================================

const Header: FC<{
    showBanner?: boolean;
    showHeader?: boolean;
}> & {
    observer?: IntersectionObserver;
} = ({ showHeader = false, showBanner = false }) => {
    const BannerRef = useRef<HTMLDivElement>(null);
    const BannerIntersectionRef = useRef<HTMLDivElement>(null);
    const [renderBanner, setRenderBanner] = useState(showBanner);

    useEffect(() => {
        if (!Header.observer) {
            Header.observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            BannerRef.current?.classList.remove(
                                styles["mod-not-in-view"]
                            );
                            console.log("Banner is in view");
                        } else {
                            BannerRef.current?.classList.add(
                                styles["mod-not-in-view"]
                            );
                            console.log("Banner is out of view");
                        }
                    });
                },
                { threshold: 0 }
            );
        }

        if (renderBanner && BannerIntersectionRef.current) {
            Header.observer.observe(BannerIntersectionRef.current);
        }

        return () => {
            if (Header.observer && BannerIntersectionRef.current) {
                Header.observer.unobserve(BannerIntersectionRef.current);
            }
        };
    }, [renderBanner]);

    return (
        <>
            {renderBanner && (
                <section className={styles["banner"]} ref={BannerRef}>
                    <div className={styles["wrapper"]}>BANNER</div>
                    <div
                        className={styles["intersection-check"]}
                        ref={BannerIntersectionRef}
                    ></div>
                </section>
            )}
            <header
                className={classNames([
                    styles["header"],
                    {
                        [styles["mod-hidden"]]: !showHeader,
                    },
                ])}
            >
                <nav className={styles["wrapper"]}>
                    LOGO, NAV, SEARCH, LINKS
                </nav>
            </header>
        </>
    );
};

export default Header;
