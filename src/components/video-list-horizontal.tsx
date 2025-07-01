import {
    useEffect,
    useRef,
    useState,
    useCallback,
    memo,
    type FC,
    type ButtonHTMLAttributes,
} from "react";
import classNames from "classnames";

import arrowLeft from "@/assets/arrow/left3.svg?raw";
import arrowRight from "@/assets/arrow/right3.svg?raw";

import VideoItem, {
    type Props as VideoItemProps,
} from "@/components/video-item";

import styles from "./video-list-horizontal.module.less";

// ============================================================================

const VideoListHorizontal: FC<{
    videos: VideoItemProps[];
}> = ({ videos }) => {
    const ContainerRef = useRef<HTMLDivElement>(null);
    const IntersectionProbeBegin = useRef<HTMLDivElement>(null);
    const IntersectionProbeEnd = useRef<HTMLDivElement>(null);
    const ObserverRef = useRef<IntersectionObserver>(null);

    const [atBegin, setAtBegin] = useState(true);
    const [atEnd, setAtEnd] = useState(false);

    const scrollByItemCount = useCallback((count: number) => {
        if (!ContainerRef.current) return;

        const items = ContainerRef.current.querySelectorAll(
            `.${styles["item"]}`
        );

        if (!items) return;
        if (!items.length) return;
        if (items.length < 2) return;

        const firstItem = items[0] as HTMLAnchorElement;
        const secondItem = items[1] as HTMLAnchorElement;

        ContainerRef.current.scrollTo({
            left:
                ContainerRef.current.scrollLeft +
                (secondItem.offsetLeft - firstItem.offsetLeft) * count,
            behavior: "smooth",
        });
    }, []);
    const scrollLeft = useCallback(() => {
        scrollByItemCount(-1);
    }, [scrollByItemCount]);
    const scrollRight = useCallback(() => {
        scrollByItemCount(1);
    }, [scrollByItemCount]);

    useEffect(() => {
        if (!ObserverRef.current) {
            ObserverRef.current = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.target === IntersectionProbeBegin.current) {
                            setAtBegin(entry.isIntersecting);
                        } else if (
                            entry.target === IntersectionProbeEnd.current
                        ) {
                            setAtEnd(entry.isIntersecting);
                        }
                    });
                },
                { root: ContainerRef.current, threshold: 0 }
            );
        }

        if (
            ObserverRef.current &&
            IntersectionProbeBegin.current &&
            IntersectionProbeEnd.current
        ) {
            ObserverRef.current.observe(IntersectionProbeBegin.current);
            ObserverRef.current.observe(IntersectionProbeEnd.current);
        }

        return () => {
            if (
                ObserverRef.current &&
                IntersectionProbeBegin.current &&
                IntersectionProbeEnd.current
            ) {
                ObserverRef.current.unobserve(IntersectionProbeBegin.current);
                ObserverRef.current.unobserve(IntersectionProbeEnd.current);
            }
            ObserverRef.current?.disconnect();
            ObserverRef.current = null;
        };
    }, []);

    return (
        <div className={styles["video-list-horizontal"]}>
            <div className={styles["scroll-container"]} ref={ContainerRef}>
                <div
                    className={classNames([
                        styles["intersection-probe"],
                        styles["intersection-probe-begin"],
                    ])}
                    ref={IntersectionProbeBegin}
                />
                {videos.map((v) => (
                    <VideoItem
                        key={v.cmsId}
                        className={styles["item"]}
                        {...v}
                    />
                ))}
                {/* TODO: added last block link to more */}
                <div
                    className={classNames([
                        styles["intersection-probe"],
                        styles["intersection-probe-end"],
                    ])}
                    ref={IntersectionProbeEnd}
                />
            </div>
            <ArrowButton
                direction="prev"
                isActive={atBegin}
                onClick={scrollLeft}
            />
            <ArrowButton
                direction="next"
                isActive={atEnd}
                onClick={scrollRight}
            />
        </div>
    );
};

export default memo(VideoListHorizontal);

// ============================================================================

const ArrowButton: FC<
    ButtonHTMLAttributes<HTMLButtonElement> & {
        direction: "prev" | "next";
        isActive?: boolean;
    }
> = ({ direction, isActive = false, className, ...props }) => {
    return (
        <span
            className={classNames([
                styles["arrow-container"],
                styles[`arrow-${direction}`],
                {
                    [styles["is-active"]]: !isActive,
                },
            ])}
        >
            <button
                className={classNames([styles["arrow"], className])}
                type="button"
                aria-label={direction === "prev" ? "前一个" : "后一个"}
                dangerouslySetInnerHTML={{
                    __html: direction === "prev" ? arrowLeft : arrowRight,
                }}
                {...props}
            />
        </span>
    );
};
