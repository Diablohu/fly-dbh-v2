import { useEffect, useRef, useState, useCallback, memo, type FC } from "react";
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
    const IntersectionCheckBegin = useRef<HTMLDivElement>(null);
    const IntersectionCheckEnd = useRef<HTMLDivElement>(null);
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
                        if (entry.target === IntersectionCheckBegin.current) {
                            setAtBegin(entry.isIntersecting);
                        } else if (
                            entry.target === IntersectionCheckEnd.current
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
            IntersectionCheckBegin.current &&
            IntersectionCheckEnd.current
        ) {
            ObserverRef.current.observe(IntersectionCheckBegin.current);
            ObserverRef.current.observe(IntersectionCheckEnd.current);
        }

        return () => {
            if (
                ObserverRef.current &&
                IntersectionCheckBegin.current &&
                IntersectionCheckEnd.current
            ) {
                ObserverRef.current.unobserve(IntersectionCheckBegin.current);
                ObserverRef.current.unobserve(IntersectionCheckEnd.current);
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
                        styles["intersection-check"],
                        styles["intersection-check-begin"],
                    ])}
                    ref={IntersectionCheckBegin}
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
                        styles["intersection-check"],
                        styles["intersection-check-end"],
                    ])}
                    ref={IntersectionCheckEnd}
                />
            </div>
            <button
                className={classNames([
                    styles["arrow"],
                    styles["arrow-left"],
                    {
                        [styles["is-active"]]: !atBegin,
                    },
                ])}
                type="button"
                onClick={scrollLeft}
                dangerouslySetInnerHTML={{
                    __html: arrowLeft,
                }}
            />
            <button
                className={classNames([
                    styles["arrow"],
                    styles["arrow-right"],
                    {
                        [styles["is-active"]]: !atEnd,
                    },
                ])}
                type="button"
                onClick={scrollRight}
                dangerouslySetInnerHTML={{
                    __html: arrowRight,
                }}
            />
        </div>
    );
};

export default memo(VideoListHorizontal);
