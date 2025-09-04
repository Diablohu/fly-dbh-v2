import { useRef, useEffect, type FC, type HTMLAttributes } from "react";

import { urlPrefixSanityImageCdn } from "@/global";

import useWindow from "@/react-hooks/use-window";

import styles from "./hero-image.module.less";

// ============================================================================

// ============================================================================

const HeroImage: FC<
    {
        title?: string;
        sanityImageFilename: string;
    } & HTMLAttributes<HTMLDivElement>
> & {
    observer?: IntersectionObserver;
    isInViewport?: boolean;
} = ({ sanityImageFilename, children }) => {
    const ContainerRef = useRef<HTMLDivElement>(null);
    const ProbeRef = useRef<HTMLDivElement>(null);

    useWindow(
        (force?: boolean) => {
            if (!force && !HeroImage.isInViewport) return;

            if (ContainerRef.current) {
                const targetHeight = ContainerRef.current.offsetHeight - 200;
                document.documentElement.style.setProperty(
                    "--hero-image-glossy-opacity",
                    `${
                        1 -
                        Math.min(
                            1,
                            Math.max(
                                0,
                                (targetHeight - window.scrollY) / targetHeight
                            )
                        )
                    }`
                );
                document.documentElement.style.setProperty(
                    "--hero-image-offset-y",
                    `${Math.min(50, Math.max(window.scrollY, 0) / 2)}px`
                );
            }
        },
        {
            resize: true,
            scroll: true,
        }
    );

    useEffect(() => {
        document.documentElement.style.removeProperty("--hero-image-offset-y");
        document.documentElement.style.removeProperty(
            "--hero-image-glossy-opacity"
        );

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

            document.documentElement.style.removeProperty(
                "--hero-image-offset-y"
            );
            document.documentElement.style.removeProperty(
                "--hero-image-glossy-opacity"
            );
        };
    }, []);

    return (
        <section className={styles["hero"]} ref={ContainerRef}>
            <div className={styles["wrapper"]}>{children}</div>
            <div className={styles["mask-overlay"]} />
            <div
                className={styles["glossy-overlay"]}
                style={{
                    backgroundImage: `url(${urlPrefixSanityImageCdn}/${sanityImageFilename}?auto=format&w=640&blur=100&q=60)`,
                }}
            />
            <div
                className={styles["image"]}
                style={{
                    backgroundImage: `url(${urlPrefixSanityImageCdn}/${sanityImageFilename}?auto=format&w=1280&q=60)`,
                }}
            />
            <div className={styles["intersection-probe"]} ref={ProbeRef} />
        </section>
    );
};

export default HeroImage;
