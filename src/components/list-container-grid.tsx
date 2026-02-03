import {
    useState,
    useEffect,
    useRef,
    useCallback,
    useMemo,
    memo,
    type FC,
    type PropsWithChildren,
} from "react";
import classNames from "classnames";
import { type ValidContentListAutoLoadMoreType } from "@/types";

import { videoListGrid as debug } from "@/utils/log";
import useContentListAutoLoadMore from "@/react-hooks/use-content-list-auto-load-more";

import styles from "./list-container-grid.module.less";

// ============================================================================

type StatusType = "ready" | "loading" | "complete" | "error";
type Props<T extends {}, R extends {} | undefined> = {
    /** 查询函数 */
    loadMore: ({ from }: { from: number }) => Promise<R | undefined>;
    itemRender: FC<T>;
    /** 每次请求的内容长度，即传统概念上的每页条目数 */
    length?: number;
    /** 初始列表内容 */
    initialList?: T[];
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
} & PropsWithChildren;

// ============================================================================

const ListContainerGrid = <
    T extends { _id: string },
    R extends
        | {
              list: T[];
              total: number;
              page: number;
          }
        | undefined,
>({
    loadMore,
    itemRender: ItemComponent,
    length = 20,
    initialList = [],
    initialListIsComplete = false,
    infiniteScroll: _infiniteScroll = false,
    defaultContentListAutoLoadMore,
    showLoadMoreButton = true,
    children,
}: Props<T, R>) => {
    const ListContainerRef = useRef<HTMLDivElement>(null);
    const InfiniteScrollProbeRef = useRef<HTMLDivElement>(null);
    const InfiniteScrollObserverRef = useRef<IntersectionObserver>(null);
    /**
     * _Ref_ 当前所在的列表索引值
     *  - 与列表内容数量同步
     */
    const CurrentIndexRef = useRef(initialList?.length || 0);
    const StatusRef = useRef<StatusType>(
        initialListIsComplete ? "complete" : "ready",
    );
    /**
     * _Ref_ 用于记录上次传入的 `slug` 值
     *  - 用于判断是否需要重置列表
     */
    // const LastSlugRef = useRef<string | undefined>(slug);

    if (
        _infiniteScroll &&
        typeof defaultContentListAutoLoadMore === "undefined"
    ) {
        throw new Error(
            `Props "defaultContentListAutoLoadMore" is required for React Component "VideoListGrid"`,
        );
    }

    const [contentListAutoLoadMore] = useContentListAutoLoadMore(
        defaultContentListAutoLoadMore ?? "0",
    );

    const [status, setStatus] = useState<StatusType>(StatusRef.current);
    const [list, setList] =
        useState<Required<Props<T, R>>["initialList"]>(initialList);

    /**
     * 是否允许自动加载更多内容，或称“无限滚动”
     */
    const infiniteScroll = useMemo(
        () => _infiniteScroll && contentListAutoLoadMore === "1",
        [_infiniteScroll, contentListAutoLoadMore],
    );

    /**
     * 加载更多内容
     *  - 手动触发和自动触发均调用该函数
     *  - 会自动更新 _State_ `status`
     *      - 开始加载时: `loading`
     *      - 加载完成，且无更多内容: `complete`
     *      - 加载完成，且还有更多内容: `ready`
     */
    const actionLoadMore = useCallback(() => {
        if (["loading", "complete"].includes(StatusRef.current)) return;

        setStatus("loading");
        loadMore({ from: CurrentIndexRef.current })
            .then((res) => {
                debug("fetch action response: %O", res);
                if (!res || !res || !Array.isArray(res.list)) {
                    throw res;
                } else {
                    const forceComplete = res.list.length < length;
                    if (!res || !res.list.length) {
                        debug("no data received. set complete");
                        setStatus("complete");
                    } else
                        setList((prevList) => {
                            if (!res) return prevList;
                            const newList = [
                                ...prevList,
                                ...res.list.filter((thisPost) => {
                                    if (!("_id" in thisPost)) return false;
                                    return !prevList.some(
                                        (prevPost) =>
                                            thisPost._id === prevPost._id,
                                    );
                                }),
                            ];
                            if (forceComplete) {
                                debug(
                                    `received item count less than ${length}. set complete. total: ${newList.length}`,
                                );
                                setStatus("complete");
                            } else {
                                debug(
                                    "list expanded: " +
                                        [
                                            `current page: ${res.page} / ${Math.ceil(
                                                res.total / length,
                                            )}`,
                                            `items: ${newList.length} / ${res.total}`,
                                        ].join(" | "),
                                );
                                if (newList.length >= res.total) {
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
    }, [loadMore, length]);

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
                            actionLoadMore();
                        }
                    });
                },
                { threshold: 0 },
            );
        }

        if (InfiniteScrollProbeRef.current)
            InfiniteScrollObserverRef.current.observe(
                InfiniteScrollProbeRef.current,
            );

        return () => {
            if (InfiniteScrollProbeRef.current)
                InfiniteScrollObserverRef.current?.unobserve(
                    InfiniteScrollProbeRef.current,
                );
            InfiniteScrollObserverRef.current?.disconnect();
            InfiniteScrollObserverRef.current = null;
        };
    }, [infiniteScroll, actionLoadMore]);

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

    // useEffect(() => {
    //     console.log(LastSlugRef.current, slug);
    //     if (LastSlugRef.current === slug) return;

    //     debug(
    //         "slug changed from %s to %s. Reset list.",
    //         LastSlugRef.current,
    //         slug
    //     );
    //     setList(initialList);
    //     setStatus(initialListIsComplete ? "complete" : "ready"); // Reset status

    //     LastSlugRef.current = slug;
    // }, [slug, initialList]);

    return (
        <div className={styles["list-container-grid"]} ref={ListContainerRef}>
            {list.map((item) => (
                <ItemComponent key={item._id} {...item} />
            ))}

            <section className={styles["block"]}>
                <span
                    ref={InfiniteScrollProbeRef}
                    className={styles["infinite-scroll-probe"]}
                />
                {showLoadMoreButton &&
                    (status === "complete" ? (
                        <span className={styles["completed"]}>没有更多啦~</span>
                    ) : (
                        <button
                            type="button"
                            onClick={actionLoadMore}
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

export default memo(ListContainerGrid) as typeof ListContainerGrid;
