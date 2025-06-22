import { useState, useEffect, useRef, useCallback, type FC } from "react";
import { actions } from "astro:actions";
import { type VideoListPageTypesType, type VideoItemType } from "@/types";

import VideoItem from "@/components/video-item";

import getVideoItemTopTag from "@/utils/get-video-item-top-tag";

import styles from "./video-list-grid.module.less";

// ============================================================================

type StatusType = "ready" | "loading" | "complete" | "error";

// ============================================================================

const VideoListGrid: FC<{
    type?: VideoListPageTypesType;
    slug?: string;
    isIndex: boolean;
    length: number;
    initialList?: VideoItemType[];
    infiniteScroll?: boolean;
}> = ({
    type,
    slug,
    isIndex,
    length,
    initialList = [],
    infiniteScroll = false,
}) => {
    const ListContainerRef = useRef<HTMLDivElement>(null);
    const InfiniteScrollIndicatorRef = useRef<HTMLDivElement>(null);
    const InfiniteScrollObserverRef = useRef<IntersectionObserver>(null);
    const CurrentIndexRef = useRef(initialList?.length || 0);
    const StatusRef = useRef<StatusType>("ready");

    const [status, setStatus] = useState<StatusType>(StatusRef.current);
    const [list, setList] = useState<VideoItemType[]>(initialList);

    const loadMore = useCallback(() => {
        if (StatusRef.current === "loading") return;

        setStatus("loading");
        actions
            .videoListPageFetch({
                type,
                slug,
                from: CurrentIndexRef.current,
                length,
            })
            .then((res) => {
                setStatus("ready");
                console.log(res.data);
            });
    }, [type, slug, length]);

    useEffect(() => {
        if (!ListContainerRef.current) return;

        if (!infiniteScroll) return;
        if (!InfiniteScrollObserverRef.current) {
            InfiniteScrollObserverRef.current = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (
                            entry.target === InfiniteScrollIndicatorRef.current
                        ) {
                            loadMore();
                        }
                    });
                },
                { root: ListContainerRef.current, threshold: 0 }
            );
        }

        return () => {
            if (ListContainerRef.current)
                InfiniteScrollObserverRef.current?.unobserve(
                    ListContainerRef.current
                );
            InfiniteScrollObserverRef.current?.disconnect();
            InfiniteScrollObserverRef.current = null;
        };
    }, [infiniteScroll, loadMore]);

    useEffect(() => {
        if (!infiniteScroll) return;
        loadMore();
    }, [loadMore, infiniteScroll]);

    useEffect(() => {
        StatusRef.current = status;
    }, [status]);

    return (
        <div className={styles["video-list-grid"]} ref={ListContainerRef}>
            {list.map((post) => (
                // TODO: tags by category
                <VideoItem
                    key={post._id}
                    cmsId={post._id}
                    slug={post.slug}
                    title={post.title}
                    cover={post.cover}
                    tags={
                        // [
                        //     Astro.props.isIndex
                        //         ? getVideoItemTopTag(post, "latest")?.name || ""
                        //         : Astro.props.type === "tag" &&
                        //             Astro.props.slug === "review"
                        //         ? getVideoItemTopTag(post, "review")?.name || ""
                        //         : "",
                        // ].filter(Boolean)
                        []
                    }
                    infos={[
                        [
                            isIndex
                                ? getVideoItemTopTag(post, "latest")?.name || ""
                                : type === "tag" && slug === "review"
                                  ? getVideoItemTopTag(post, "review")?.name ||
                                    ""
                                  : "",
                            new Date(post.release),
                        ].filter(Boolean),
                    ]}
                />
            ))}
            <div
                ref={InfiniteScrollIndicatorRef}
                className={styles["infinite-scroll-indicator"]}
            ></div>
            <button onClick={loadMore}>LOAD MORE</button>
        </div>
    );
};

export default VideoListGrid;
