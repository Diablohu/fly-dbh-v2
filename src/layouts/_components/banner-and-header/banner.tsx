import { useState, useRef, useEffect, memo, type FC } from "react";
import classNames from "classnames";

import { slogan } from "@/global";
import useWindow from "@/react-hooks/use-window";

import bannerVidMedWebm from "@/assets/banner-video/30fps/medium.webm";
import bannerVidLowMP4 from "@/assets/banner-video/30fps/low.mp4";
import bannerCoverImage from "@/assets/banner-video/cover.webp";

import styles from "./index.module.less";

import { links, type Props } from "./";

// ============================================================================

const Banner: FC<Pick<Props, "showBanner" | "logo">> & {
    observer?: IntersectionObserver;
    bannerInView?: boolean;
} = ({ showBanner, logo }) => {
    const BannerRef = useRef<HTMLDivElement>(null);
    const BannerIntersectionRef = useRef<HTMLDivElement>(null);
    const VideoRef = useRef<HTMLVideoElement>(null);

    const [renderBanner, setRenderBanner] = useState(showBanner);
    const [renderVideo, setRenderVideo] = useState(false);

    useWindow(
        (force?: boolean) => {
            if (!force && !Banner.bannerInView) return;

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
        },
        {
            resize: true,
            scroll: true,
        }
    );

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
                            Banner.bannerInView = true;
                            BannerRef.current?.classList.remove(
                                styles["mod-not-in-view"]
                            );
                            VideoRef.current?.play();
                            // console.log("Banner is in view");
                        } else {
                            // console.log(
                            //     "not inview",
                            //     BannerRef.current,
                            //     BannerIntersectionRef.current
                            // );
                            Banner.bannerInView = false;
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
        setRenderBanner(showBanner);
        if (showBanner) {
            // setTimeout(() => {
            //     console.log(BannerRef.current);
            // });
        } else {
            Banner.bannerInView = false;
        }
    }, [showBanner]);

    useEffect(() => {
        setRenderVideo(true);

        return () => {
            Banner.observer?.disconnect();
            Banner.observer = undefined;
        };
    }, []);

    return (
        renderBanner && (
            <section className={styles["banner"]} ref={BannerRef}>
                <section className={styles["wrapper"]}>
                    {logo}
                    <strong className={styles["slogan"]}>{slogan}</strong>
                    <section className={styles["links"]}>
                        {links.map(({ name, title, href }) => (
                            <a
                                key={name}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
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
                        backgroundImage: `url(${bannerCoverImage.src})`,
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
