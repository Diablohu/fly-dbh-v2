import {
    useState,
    useEffect,
    useRef,
    useCallback,
    useMemo,
    memo,
    type FC,
} from "react";
import { actions } from "astro:actions";
import dbg from "debug";
import { type VideoListPageTypesType, type VideoItemType } from "@/types";
import { VIDEO_LIST_GRID } from "@/constants/debug-keys";

import VideoItem from "@/components/video-item";

import getVideoItemTopTag from "@/utils/get-video-item-top-tag";

import styles from "./video-list-grid.module.less";

// ============================================================================

type StatusType = "ready" | "loading" | "complete" | "error";
type Props = {
    type?: VideoListPageTypesType;
    slug?: string;
    isIndex?: boolean;
    length: number;
    initialList?: (Partial<VideoItemType> &
        Pick<VideoItemType, "_id" | "title" | "release" | "cover">)[];
    initialListIsComplete?: boolean;
    infiniteScroll?: boolean;
};

const debug = dbg(VIDEO_LIST_GRID);
debug.namespace = VIDEO_LIST_GRID;

if (import.meta.env.DEV || import.meta.env.MODE === "test") {
    debug.enabled = true;
}

// ============================================================================

const VideoListGrid: FC<Props> = ({
    type,
    slug,
    isIndex: _isIndex,
    length,
    initialList = [],
    initialListIsComplete = false,
    infiniteScroll = false,
}) => {
    const ListContainerRef = useRef<HTMLDivElement>(null);
    const InfiniteScrollIndicatorRef = useRef<HTMLDivElement>(null);
    const InfiniteScrollObserverRef = useRef<IntersectionObserver>(null);
    const CurrentIndexRef = useRef(initialList?.length || 0);
    const StatusRef = useRef<StatusType>(
        initialListIsComplete ? "complete" : "ready"
    );

    const [status, setStatus] = useState<StatusType>(StatusRef.current);
    const [list, setList] =
        useState<Required<Props>["initialList"]>(initialList);

    const isIndex = useMemo(
        () => (typeof _isIndex === "boolean" ? _isIndex : !type),
        [_isIndex, type]
    );

    const loadMore = useCallback(() => {
        if (["loading", "complete"].includes(StatusRef.current)) return;

        setStatus("loading");
        actions
            .videoListPageFetch({
                type,
                slug,
                from: CurrentIndexRef.current,
                length,
            })
            .then((res) => {
                debug("fetch action response: %O", res.data);
                if (!res || !res.data || !Array.isArray(res.data.list)) {
                    throw res;
                } else {
                    const forceComplete = res.data.list.length < length;
                    if (!res.data.list.length) {
                        debug("no data received. set complete");
                        setStatus("complete");
                    } else
                        setList((prevList) => {
                            const newList = [
                                ...prevList,
                                ...res.data.list.filter(
                                    ({ _id }) =>
                                        !prevList.some(
                                            (post) => post._id === _id
                                        )
                                ),
                            ];
                            if (forceComplete) {
                                debug(
                                    `received item count less than ${length}. set complete. total: ${newList.length}`
                                );
                                setStatus("complete");
                            } else {
                                debug(
                                    "list expanded: " +
                                        [
                                            `current page: ${res.data.page} / ${Math.ceil(
                                                res.data.total / length
                                            )}`,
                                            `items: ${newList.length} / ${res.data.total}`,
                                        ].join(" | ")
                                );
                                if (newList.length >= res.data.total) {
                                    setStatus("complete");
                                } else {
                                    setStatus("ready");
                                }
                            }
                            return newList;
                        });
                }
            })
            .catch((err) => {
                console.trace(err);
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
                            entry.target ===
                                InfiniteScrollIndicatorRef.current &&
                            entry.isIntersecting
                        ) {
                            loadMore();
                        }
                    });
                },
                { threshold: 0 }
            );
        }

        if (InfiniteScrollIndicatorRef.current)
            InfiniteScrollObserverRef.current.observe(
                InfiniteScrollIndicatorRef.current
            );

        return () => {
            if (InfiniteScrollIndicatorRef.current)
                InfiniteScrollObserverRef.current?.unobserve(
                    InfiniteScrollIndicatorRef.current
                );
            InfiniteScrollObserverRef.current?.disconnect();
            InfiniteScrollObserverRef.current = null;
        };
    }, [infiniteScroll, loadMore]);

    // useEffect(() => {
    //     if (!infiniteScroll) return;
    //     loadMore();
    // }, [loadMore, infiniteScroll]);

    useEffect(() => {
        StatusRef.current = status;
    }, [status]);

    useEffect(() => {
        CurrentIndexRef.current = list.length;
    }, [list]);

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
                    // tags={[
                    //     isIndex
                    //         ? getVideoItemTopTag(post, "latest")?.name || ""
                    //         : type === "tag" && slug === "review"
                    //           ? getVideoItemTopTag(post, "review")?.name || ""
                    //           : "",
                    // ].filter(Boolean)}
                    infos={[
                        [
                            isIndex
                                ? getVideoItemTopTag(post, "latest")?.name || ""
                                : type === "tag" && slug === "news"
                                  ? getVideoItemTopTag(post, "news")?.name || ""
                                  : type === "tag" && slug === "review"
                                    ? getVideoItemTopTag(post, "review")
                                          ?.name || ""
                                    : "",
                            new Date(post.release),
                        ].filter(Boolean),
                    ]}
                />
            ))}

            <section className={styles["block"]}>
                <span
                    ref={InfiniteScrollIndicatorRef}
                    className={styles["infinite-scroll-indicator"]}
                />
                {status === "complete" ? (
                    <span className={styles["completed"]}>没有更多啦~</span>
                ) : (
                    <button
                        type="button"
                        onClick={loadMore}
                        disabled={["loading", "complete"].includes(status)}
                    >
                        {status === "loading" ? "获取更多..." : "获取更多"}
                    </button>
                )}
            </section>
        </div>
    );
};

export default memo(VideoListGrid);
