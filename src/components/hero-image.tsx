import {
    useRef,
    useEffect,
    useCallback,
    useMemo,
    type FC,
    type HTMLAttributes,
    type ReactNode,
} from "react";

import { urlPrefixSanityImageCdn } from "@/global";

import useWindow from "@/react-hooks/use-window";

import styles from "./hero-image.module.less";

// ============================================================================

// ============================================================================

const HeroImage: FC<
    {
        title?: string;
        subTitle?: string;
        actions?: ReactNode;
        sanityImageFilename?: string;
        sanityImageUri?: string;
        expandedHeight?: number;
    } & HTMLAttributes<HTMLDivElement>
> & {
    observer?: IntersectionObserver;
    isInViewport?: boolean;
} = ({
    title,
    subTitle,
    actions,
    sanityImageFilename,
    sanityImageUri,
    expandedHeight,
    children,
}) => {
    const ContainerRef = useRef<HTMLDivElement>(null);
    const WrapperRef = useRef<HTMLDivElement>(null);
    const ProbeRef = useRef<HTMLDivElement>(null);

    const imageSrc = useMemo(() => {
        const uri = sanityImageFilename
            ? `${urlPrefixSanityImageCdn}/${sanityImageFilename}`
            : sanityImageUri;
        if (!uri) return "";
        return `${uri}?auto=format&w=1280&q=60`;
    }, [sanityImageFilename, sanityImageUri]);

    const resetCssVariables = useCallback(() => {
        document.documentElement.style.removeProperty("--hero-image-offset-y");
        document.documentElement.style.removeProperty(
            "--hero-image-glossy-opacity"
        );
        document.documentElement.style.removeProperty(
            "--hero-image-stiky-height"
        );
    }, []);

    useWindow(
        (force?: boolean) => {
            if (!HeroImage.isInViewport) {
                document.documentElement.style.setProperty(
                    "--hero-image-glossy-opacity",
                    `1`
                );
            } else if (ProbeRef.current) {
                const targetHeight = ProbeRef.current.offsetHeight;
                const headerHeight = parseInt(
                    window
                        .getComputedStyle(document.documentElement)
                        .getPropertyValue("--global-header-height")
                );
                document.documentElement.style.setProperty(
                    "--hero-image-glossy-opacity",
                    `${
                        1 -
                        Math.min(
                            1,
                            Math.max(
                                0,
                                (targetHeight - window.scrollY - headerHeight) /
                                    targetHeight
                            )
                        )
                    }`
                );
                document.documentElement.style.setProperty(
                    "--hero-image-offset-y",
                    // `${Math.min(targetHeight - headerHeight, (Math.max(window.scrollY, 0) * 4) / 5)}px`
                    `${(Math.min(window.scrollY, targetHeight - headerHeight) * 2) / 3}px`
                );
            }
        },
        {
            resize: true,
            scroll: true,
        }
    );

    // 将内容区高度映射为 `--hero-image-stiky-height`
    useWindow(
        (force?: boolean) => {
            if (!HeroImage.isInViewport) {
                document.documentElement.style.setProperty(
                    "--hero-image-glossy-opacity",
                    `1`
                );
            } else if (WrapperRef.current) {
                // --hero-image-stiky-height
                const targetHeight = WrapperRef.current.offsetHeight;
                document.documentElement.style.setProperty(
                    "--hero-image-stiky-height",
                    `${targetHeight}px`
                );
            }
        },
        {
            resize: true,
        }
    );

    useEffect(() => {
        resetCssVariables();

        if (!HeroImage.observer) {
            HeroImage.observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            // console.log(
                            //     "inview",
                            //     ContainerRef.current,
                            //     BannerIntersectionRef.current
                            // );
                            HeroImage.isInViewport = true;
                            ContainerRef.current?.classList.remove(
                                styles["mod-not-in-view"]
                            );
                            // console.log("HeroImage is in view");
                        } else {
                            // console.log(
                            //     "not inview",
                            //     ContainerRef.current,
                            //     BannerIntersectionRef.current
                            // );
                            HeroImage.isInViewport = false;
                            ContainerRef.current?.classList.add(
                                styles["mod-not-in-view"]
                            );
                            // console.log("HeroImage is out of view");
                        }
                    });
                },
                { threshold: 0 }
            );
        }

        if (ProbeRef.current) HeroImage.observer.observe(ProbeRef.current);

        return () => {
            if (HeroImage.observer && ProbeRef.current)
                HeroImage.observer.unobserve(ProbeRef.current);
            HeroImage.observer?.disconnect();
            HeroImage.observer = undefined;

            resetCssVariables();
        };
    }, [resetCssVariables]);

    return (
        <section
            className={styles["hero"]}
            ref={ContainerRef}
            style={
                {
                    "--custom-expanded-height": expandedHeight
                        ? `${expandedHeight}px`
                        : undefined,
                } as unknown as React.CSSProperties
            }
        >
            <div className={styles["wrapper"]} ref={WrapperRef}>
                {title && (
                    <h1 className={styles["title"]}>
                        {title}
                        {subTitle && <small>{subTitle}</small>}
                    </h1>
                )}
                {children}
                {actions && <div className={styles["actions"]}>{actions}</div>}
            </div>
            <div className={styles["mask-overlay"]} />
            {/* <div
                className={styles["glossy-overlay"]}
                style={{
                    backgroundImage: `url(${urlPrefixSanityImageCdn}/${sanityImageFilename}?auto=format&w=640&blur=100&q=60)`,
                }}
            /> */}
            <div
                className={styles["image"]}
                style={{
                    backgroundImage: `url(${imageSrc})`,
                }}
            />
            <div className={styles["intersection-probe"]} ref={ProbeRef} />
        </section>
    );
};

export default HeroImage;
