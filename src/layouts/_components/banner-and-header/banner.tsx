import {
    useState,
    useRef,
    useEffect,
    useCallback,
    memo,
    type FC,
    type TransitionEventHandler,
} from "react";
import classNames from "classnames";

import { slogan } from "@/global";
import useWindow from "@/react-hooks/use-window";
import { homeBannerVisible as rootClassNameBannerVisible } from "@/constants/root-classnames";

import bannerVidMedWebm from "@/assets/banner-video/30fps/medium.webm";
import bannerVidLowMP4 from "@/assets/banner-video/30fps/low.mp4";

import styles from "./index.module.less";

import { links, type Props } from "./";

// ============================================================================

const Banner: FC<
    Pick<Props, "banner" | "logo"> & {
        coverImage?: Props["bannerCoverImage"];
    }
> & {
    observer?: IntersectionObserver;
    bannerInView?: boolean;
} = ({ banner, logo, coverImage }) => {
    const BannerRef = useRef<HTMLDivElement>(null);
    const BannerIntersectionRef = useRef<HTMLDivElement>(null);
    const VideoRef = useRef<HTMLVideoElement>(null);

    const [renderBanner, setRenderBanner] = useState(banner);
    const [renderVideo, setRenderVideo] = useState(false);
    const [unmountedOnce, setUnmountedOnce] = useState(false);

    const onBannerTransitionEnd = useCallback<
        TransitionEventHandler<HTMLElement>
    >(
        (/*evt*/) => {
            // const marginTop = getComputedStyle(evt.currentTarget).marginTop;
            // if (marginTop && parseInt(marginTop) < 0) {
            //     Banner.bannerInView = false;
            //     setRenderBanner(false);
            //     setUnmountedOnce(true);
            // }
        },
        [],
    );

    /** 计算并设置视差滚动样式值 */
    const setParallaxStyles = useCallback((force?: boolean) => {
        if (!force && !Banner.bannerInView) return;

        if (BannerRef.current) {
            const wrapperHeight = BannerRef.current.offsetHeight;
            BannerRef.current.style.setProperty(
                "--content-scale",
                `${Math.min(
                    1,
                    Math.max(
                        0,
                        (wrapperHeight - window.scrollY) / wrapperHeight,
                    ),
                )}`,
            );
            BannerRef.current.style.setProperty(
                "--video-offset-y",
                `${Math.max(window.scrollY, 0) / 2}px`,
            );
        }
    }, []);
    useWindow(setParallaxStyles, {
        resize: true,
        scroll: true,
    });

    useEffect(() => {
        if (!Banner.observer) {
            Banner.observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            // console.log(
                            //     "inview",
                            //     BannerRef.current,
                            //     BannerIntersectionRef.current
                            // );
                            document.documentElement.classList.add(
                                rootClassNameBannerVisible,
                            );
                            Banner.bannerInView = true;
                            BannerRef.current?.classList.remove(
                                styles["mod-not-in-view"],
                            );
                            VideoRef.current?.play();
                            // console.log("Banner is in view");
                        } else {
                            // console.log(
                            //     "not inview",
                            //     BannerRef.current,
                            //     BannerIntersectionRef.current
                            // );
                            document.documentElement.classList.remove(
                                rootClassNameBannerVisible,
                            );
                            Banner.bannerInView = false;
                            BannerRef.current?.classList.add(
                                styles["mod-not-in-view"],
                            );
                            VideoRef.current?.pause();
                            // console.log("Banner is out of view");
                        }
                    });
                },
                { threshold: 0 },
            );
        }

        if (BannerIntersectionRef.current) {
            if (renderBanner) {
                Banner.observer.observe(BannerIntersectionRef.current);
            } else {
                Banner.observer.unobserve(BannerIntersectionRef.current);
            }
        }

        return () => {
            if (Banner.observer && BannerIntersectionRef.current) {
                Banner.observer.unobserve(BannerIntersectionRef.current);
            }
        };
    }, [renderBanner]);

    useEffect(() => {
        // TODO: banner 关闭动画
        if (banner) {
            setRenderBanner(true);
            // setTimeout(() => {
            //     console.log(BannerRef.current);
            // });
        } else {
            // console.log(window.pageYOffset)
            // if (BannerRef.current) {
            //     BannerRef.current.style.setProperty(
            //         "--global-banner-offset",
            //         `${BannerRef.current.offsetHeight * -1}px`
            //     );
            // }
            setRenderBanner(false);
            setUnmountedOnce(true);
        }
    }, [banner]);

    useEffect(() => {
        setRenderVideo(true);

        return () => {
            Banner.observer?.disconnect();
            Banner.observer = undefined;
        };
    }, []);

    return (
        renderBanner && (
            <section
                className={classNames([
                    styles["banner"],
                    {
                        [styles["mod-unmounted-once"]]: unmountedOnce,
                    },
                ])}
                onTransitionEnd={onBannerTransitionEnd}
                ref={BannerRef}
            >
                <section className={styles["wrapper"]}>
                    {logo}
                    <strong className={styles["slogan"]}>{slogan}</strong>
                    <section className={styles["links"]}>
                        {links.map(({ name, title, href }) => (
                            <a
                                key={name}
                                href={href}
                                target="_blank"
                                rel="nofollow noopener noreferrer external"
                                className={classNames([
                                    styles["link"],
                                    styles[`link-${name}`],
                                ])}
                            >
                                {title}
                                <em />
                            </a>
                        ))}
                    </section>
                </section>
                <section
                    className={styles["video-container"]}
                    style={{
                        backgroundImage: `url(${coverImage})`,
                    }}
                >
                    {renderVideo && (
                        <video
                            // poster={require('@assets/banner/cover.jpg').default}
                            crossOrigin="anonymous"
                            preload="auto"
                            playsInline
                            autoPlay={false}
                            loop
                            muted
                            ref={VideoRef}
                        >
                            <source type="video/webm" src={bannerVidMedWebm} />
                            <source type="video/mp4" src={bannerVidLowMP4} />
                        </video>
                    )}
                </section>
                <div
                    className={styles["intersection-check"]}
                    ref={BannerIntersectionRef}
                />
            </section>
        )
    );
};

export default memo(Banner);
