import {
    useCallback,
    useState,
    useRef,
    useEffect,
    type FC,
    type ReactNode,
} from "react";
import classNames from "classnames";

import { slogan } from "@/global";

import bannerVidMedWebm from "@/assets/banner-video/30fps/medium.webm";
import bannerVidLowMP4 from "@/assets/banner-video/30fps/low.mp4";

import styles from "./banner-and-header.module.less";

// ============================================================================

const Header: FC<{
    showBanner?: boolean;
    showHeader?: boolean;
    logo?: ReactNode;
}> & {
    observer?: IntersectionObserver;
    bannerInView?: boolean;
    bannerAnimateTicking?: boolean;
    bannerAnimateRequestTick: () => void;
} = ({ showHeader = false, showBanner = false, logo }) => {
    const BannerRef = useRef<HTMLDivElement>(null);
    const BannerIntersectionRef = useRef<HTMLDivElement>(null);
    const VideoRef = useRef<HTMLVideoElement>(null);
    const [renderBanner, setRenderBanner] = useState(showBanner);

    const setStylesFunction = useCallback(() => {
        // reset the tick so we can
        // capture the next onScroll
        Header.bannerAnimateTicking = false;

        if (!Header.bannerInView) return;

        if (BannerRef.current) {
            const wrapperHeight = BannerRef.current.offsetHeight;
            BannerRef.current.style.setProperty(
                "--content-scale",
                `${Math.min(
                    1,
                    Math.max(
                        0,
                        (wrapperHeight - window.scrollY) / wrapperHeight
                    )
                )}`
            );
            BannerRef.current.style.setProperty(
                "--video-offset-y",
                `${window.scrollY / 2}px`
            );
        }
    }, []);
    const setStyles = useCallback(() => {
        if (!Header.bannerAnimateTicking) {
            requestAnimationFrame(setStylesFunction);
        }
        Header.bannerAnimateTicking = true;
    }, [setStylesFunction]);

    useEffect(() => {
        if (!Header.observer) {
            Header.observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            Header.bannerInView = true;
                            BannerRef.current?.classList.remove(
                                styles["mod-not-in-view"]
                            );
                            VideoRef.current?.play();
                            // console.log("Banner is in view");
                        } else {
                            Header.bannerInView = false;
                            BannerRef.current?.classList.add(
                                styles["mod-not-in-view"]
                            );
                            VideoRef.current?.pause();
                            // console.log("Banner is out of view");
                        }
                    });
                },
                { threshold: 0 }
            );
        }

        if (BannerIntersectionRef.current) {
            if (renderBanner) {
                Header.observer.observe(BannerIntersectionRef.current);
            } else {
                Header.observer.unobserve(BannerIntersectionRef.current);
            }
        }

        return () => {
            if (Header.observer && BannerIntersectionRef.current) {
                Header.observer.unobserve(BannerIntersectionRef.current);
            }
        };
    }, [renderBanner]);

    useEffect(() => {
        setStyles();
        window.addEventListener("resize", setStyles);
        window.addEventListener("scroll", setStyles);
        // VideoRef.current.play();
        return () => {
            window.removeEventListener("resize", setStyles);
            window.removeEventListener("scroll", setStyles);
        };
    }, [setStyles]);

    useEffect(() => {
        // TODO: banner 关闭动画
        setRenderBanner(showBanner);
        if (!showBanner) {
            Header.bannerInView = false;
        }
    }, [showBanner]);

    return (
        <>
            {renderBanner && (
                <section className={styles["banner"]} ref={BannerRef}>
                    <div className={styles["wrapper"]}>
                        {logo}
                        <strong className={styles["slogan"]}>{slogan}</strong>
                        <div className={styles["links"]}>
                            哔哩哔哩, YouTube, 抖音, 直播间, 粉丝群
                        </div>
                    </div>
                    <video
                        // poster={require('@assets/banner/cover.jpg').default}
                        crossOrigin="anonymous"
                        preload="auto"
                        playsInline
                        autoPlay
                        loop
                        muted
                        ref={VideoRef}
                    >
                        <source type="video/webm" src={bannerVidMedWebm} />
                        <source type="video/mp4" src={bannerVidLowMP4} />
                    </video>
                    <div
                        className={styles["intersection-check"]}
                        ref={BannerIntersectionRef}
                    />
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
Header.bannerAnimateRequestTick = () => {
    if (!Header.bannerAnimateTicking) {
        requestAnimationFrame(Header.bannerAnimateRequestTick);
    }
    Header.bannerAnimateTicking = true;
};

export default Header;
