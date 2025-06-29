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
    /**
     * 当前是否是“首页”型
     *  - 决定“标签”内容类型
     */
    isIndex?: boolean;
    /** 每次请求的内容长度，即传统概念上的每页条目数 */
    length?: number;
    initialList?: (Partial<VideoItemType> &
        Pick<VideoItemType, "_id" | "title" | "release" | "cover">)[];
    /** 初始列表是否已完成（已没有更多内容） */
    initialListIsComplete?: boolean;
    /**
     * 是否启用无限滚动（自动加载更多内容）功能
     *  - 注！如需启用，则 **必须** 传入 `defaultContentListAutoLoadMore`
     */
    infiniteScroll?: boolean;
    /**
     * 如果需要无限滚动（自动加载更多内容）功能，
     * 则 **必须** 传入 Astro SSR Cookie 值
     */
    defaultContentListAutoLoadMore?: ValidContentListAutoLoadMoreType;
    /**
     * 是否显示【加载更多】按钮
     *  - 默认值: 显示 `true`
     *  - 是否启用无限滚动（自动加载更多内容），与这个开关不相关
     *      - 即，不显示按钮时，也能自动加载更多
     */
    showLoadMoreButton?: boolean;
    /**
     * **强制** 指定是否显示标签，如果显示，确定显示的“目的”类型
     */
    tagPurpose?: Parameters<typeof getVideoItemTopTag>[1];
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
    defaultContentListAutoLoadMore,
    showLoadMoreButton = true,
    tagPurpose,
}) => {
    const ListContainerRef = useRef<HTMLDivElement>(null);
    const InfiniteScrollProbeRef = useRef<HTMLDivElement>(null);
    const InfiniteScrollObserverRef = useRef<IntersectionObserver>(null);
    /**
     * _Ref_ 当前所在的列表索引值
     *  - 与列表内容数量同步
     */
    const CurrentIndexRef = useRef(initialList?.length || 0);
    const StatusRef = useRef<StatusType>(
        initialListIsComplete ? "complete" : "ready"
    );

    if (
        _infiniteScroll &&
        typeof defaultContentListAutoLoadMore === "undefined"
    ) {
        throw new Error(
            `Props "defaultContentListAutoLoadMore" is required for React Component "VideoListGrid"`
        );
    }

    const [contentListAutoLoadMore] = useContentListAutoLoadMore(
        defaultContentListAutoLoadMore ?? "0"
    );

    const [status, setStatus] = useState<StatusType>(StatusRef.current);
    const [list, setList] =
        useState<Required<Props>["initialList"]>(initialList);

    /**
     * 当前是否是“首页”型
     *  - 决定“标签”内容类型
     */
    const isIndex = useMemo(
        () => (typeof _isIndex === "boolean" ? _isIndex : !type),
        [_isIndex, type]
    );
    /**
     * 是否允许自动加载更多内容，或称“无限滚动”
     */
    const infiniteScroll = useMemo(
        () => _infiniteScroll && contentListAutoLoadMore === "1",
        [_infiniteScroll, contentListAutoLoadMore]
    );

    /**
     * 加载更多内容
     *  - 手动触发和自动触发均调用该函数
     *  - 会自动更新 _State_ `status`
     *      - 开始加载时: `loading`
     *      - 加载完成，且无更多内容: `complete`
     *      - 加载完成，且还有更多内容: `ready`
     */
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

    /**
     * 获取要显示的“标签”
     *  - 根据列表类型 `type` 和 `slug` 属性，以及 `tagPurpose` 属性决定
     *  - 基于 `getVideoItemTopTag` 工具函数
     */
    const getTags = useCallback(
        (post: (typeof initialList)[0]) => {
            let topTag: string | undefined;

            if (tagPurpose === "latest" || isIndex)
                topTag = getVideoItemTopTag(post, "latest")?.name;
            else if (
                tagPurpose === "news" ||
                (type === "tag" && slug === "news")
            )
                topTag = getVideoItemTopTag(post, "news")?.name;
            else if (
                tagPurpose === "tutorial" ||
                (type === "tag" && slug === "tutorial")
            )
                topTag = getVideoItemTopTag(post, "tutorial")?.name;
            else if (
                tagPurpose === "review" ||
                (type === "tag" && slug === "review")
            )
                topTag = getVideoItemTopTag(post, "review")?.name;
            else if (
                tagPurpose === "preview" ||
                (type === "tag" && slug === "preview")
            )
                topTag = getVideoItemTopTag(post, "preview")?.name;
            else if (
                tagPurpose === "world" ||
                (type === "tag" && slug === "world")
            )
                topTag = getVideoItemTopTag(post, "world")?.name;
            else if (
                tagPurpose === "chat" ||
                (type === "tag" && slug === "chat")
            )
                topTag = getVideoItemTopTag(post, "chat")?.name;
            else if (
                tagPurpose === "short" ||
                (type === "tag" && slug === "short")
            )
                topTag = getVideoItemTopTag(post, "short")?.name;
            else if (
                [
                    "aerodrome",
                    "developer",
                    "platform",
                    "platformUpdate",
                    "event",
                ].includes(type || "") ||
                (type === "tag" && slug === "fun")
            )
                topTag = getVideoItemTopTag(post, "latest")?.name;

            if (topTag) return [topTag];
            return undefined;
        },
        [type, slug, isIndex, tagPurpose]
    );

    // 准备检测自动加载更多的 Observer
    useEffect(() => {
        if (!ListContainerRef.current) return;

        if (!infiniteScroll) return;
        if (!InfiniteScrollObserverRef.current) {
            InfiniteScrollObserverRef.current = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (
                            entry.target === InfiniteScrollProbeRef.current &&
                            entry.isIntersecting
                        ) {
                            loadMore();
                        }
                    });
                },
                { threshold: 0 }
            );
        }

        if (InfiniteScrollProbeRef.current)
            InfiniteScrollObserverRef.current.observe(
                InfiniteScrollProbeRef.current
            );

        return () => {
            if (InfiniteScrollProbeRef.current)
                InfiniteScrollObserverRef.current?.unobserve(
                    InfiniteScrollProbeRef.current
                );
            InfiniteScrollObserverRef.current?.disconnect();
            InfiniteScrollObserverRef.current = null;
        };
    }, [infiniteScroll, loadMore]);

    // useEffect(() => {
    //     if (!infiniteScroll) return;
    //     loadMore();
    // }, [loadMore, infiniteScroll]);

    // 同步 `StatusRef` 和 _State_ `status`
    useEffect(() => {
        StatusRef.current = status;
    }, [status]);

    // 更新 `CurrentIndexRef`
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
                    duration={post.duration}
                    tags={getTags(post)}
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
                    ref={InfiniteScrollProbeRef}
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
