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
import classNames from "classnames";
import {
    type VideoListPageTypesType,
    type VideoItemType,
    type ValidContentListAutoLoadMoreType,
} from "@/types";

import { videoListGrid as debug } from "@/utils/log";
import VideoItem from "@/components/video-item";
import useContentListAutoLoadMore from "@/react-hooks/use-content-list-auto-load-more";

import getVideoItemTopTag from "@/utils/get-video-item-top-tag";

import styles from "./video-list-grid.module.less";

// ============================================================================

type StatusType = "ready" | "loading" | "complete" | "error";
type Props = {
    type?: VideoListPageTypesType;
    slug?: string;
    isIndex?: boolean;
    length?: number;
    initialList?: (Partial<VideoItemType> &
        Pick<VideoItemType, "_id" | "title" | "release" | "cover">)[];
    initialListIsComplete?: boolean;
    infiniteScroll?: boolean;
    defaultContentListAutoLoadMore?: ValidContentListAutoLoadMoreType;
    showLoadMoreButton?: boolean;
};

// ============================================================================

const VideoListGrid: FC<Props> = ({
    type,
    slug,
    isIndex: _isIndex,
    length = 20,
    initialList = [],
    initialListIsComplete = false,
    infiniteScroll: _infiniteScroll = false,
    defaultContentListAutoLoadMore = "0",
    showLoadMoreButton = true,
}) => {
    const ListContainerRef = useRef<HTMLDivElement>(null);
    const InfiniteScrollIndicatorRef = useRef<HTMLDivElement>(null);
    const InfiniteScrollObserverRef = useRef<IntersectionObserver>(null);
    const CurrentIndexRef = useRef(initialList?.length || 0);
    const StatusRef = useRef<StatusType>(
        initialListIsComplete ? "complete" : "ready"
    );

    const [contentListAutoLoadMore] = useContentListAutoLoadMore(
        defaultContentListAutoLoadMore
    );

    const [status, setStatus] = useState<StatusType>(StatusRef.current);
    const [list, setList] =
        useState<Required<Props>["initialList"]>(initialList);

    const isIndex = useMemo(
        () => (typeof _isIndex === "boolean" ? _isIndex : !type),
        [_isIndex, type]
    );
    const infiniteScroll = useMemo(
        () => _infiniteScroll && contentListAutoLoadMore === "1",
        [_infiniteScroll, contentListAutoLoadMore]
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
                    if (!res.data || !res.data.list.length) {
                        debug("no data received. set complete");
                        setStatus("complete");
                    } else
                        setList((prevList) => {
                            if (!res.data) return prevList;
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
                <VideoItem
                    key={post._id}
                    cmsId={post._id}
                    slug={post.slug}
                    title={post.title}
                    cover={post.cover}
                    tags={[
                        isIndex
                            ? getVideoItemTopTag(post, "latest")?.name || ""
                            : type === "tag" && slug === "news"
                              ? getVideoItemTopTag(post, "news")?.name || ""
                              : type === "tag" && slug === "tutorial"
                                ? getVideoItemTopTag(post, "tutorial")?.name ||
                                  ""
                                : type === "tag" && slug === "review"
                                  ? getVideoItemTopTag(post, "review")?.name ||
                                    ""
                                  : type === "tag" && slug === "world"
                                    ? getVideoItemTopTag(post, "world")?.name ||
                                      ""
                                    : type === "tag" && slug === "chat"
                                      ? getVideoItemTopTag(post, "chat")
                                            ?.name || ""
                                      : type === "tag" && slug === "short"
                                        ? getVideoItemTopTag(post, "short")
                                              ?.name || ""
                                        : [
                                                "aerodrome",
                                                "aircraftOnboardDevice",
                                                "developer",
                                                "platform",
                                                "platformUpdate",
                                            ].includes(type || "")
                                          ? getVideoItemTopTag(post, "latest")
                                                ?.name || ""
                                          : "",
                    ].filter(Boolean)}
                    infos={[
                        // [
                        //     isIndex
                        //         ? getVideoItemTopTag(post, "latest")?.name || ""
                        //         : type === "tag" && slug === "news"
                        //           ? getVideoItemTopTag(post, "news")?.name || ""
                        //           : type === "tag" && slug === "tutorial"
                        //             ? getVideoItemTopTag(post, "tutorial")
                        //                   ?.name || ""
                        //             : type === "tag" && slug === "review"
                        //               ? getVideoItemTopTag(post, "review")
                        //                     ?.name || ""
                        //               : type === "tag" && slug === "world"
                        //                 ? getVideoItemTopTag(post, "world")
                        //                       ?.name || ""
                        //                 : [
                        //                         "aerodrome",
                        //                         "developer",
                        //                         "platform",
                        //                         "platformUpdate",
                        //                     ].includes(type || "")
                        //                   ? getVideoItemTopTag(post, "latest")
                        //                         ?.name || ""
                        //                   : "",
                        //     new Date(post.release),
                        // ].filter(Boolean),
                        new Date(post.release),
                    ]}
                />
            ))}

            <section className={styles["block"]}>
                <span
                    ref={InfiniteScrollIndicatorRef}
                    className={styles["infinite-scroll-indicator"]}
                />
                {showLoadMoreButton &&
                    (status === "complete" ? (
                        <span className={styles["completed"]}>没有更多啦~</span>
                    ) : (
                        <button
                            type="button"
                            onClick={loadMore}
                            className={classNames([
                                styles["button-load-more"],
                                {
                                    [styles["is-loading"]]:
                                        status === "loading",
                                },
                            ])}
                            disabled={["loading", "complete"].includes(status)}
                        >
                            {status === "loading" ? "加载更多..." : "加载更多"}
                        </button>
                    ))}
            </section>
        </div>
    );
};

export default memo(VideoListGrid);
