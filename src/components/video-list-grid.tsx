import { useState, useRef, useCallback, useMemo, memo, type FC } from "react";
import { actions } from "astro:actions";
import {
    type VideoListPageTypesType,
    type VideoItemType,
    type ValidContentListAutoLoadMoreType,
} from "@/types";

import ListContainerGrid from "@/components/list-container-grid";
import VideoItem from "@/components/video-item";
import useContentListAutoLoadMore from "@/react-hooks/use-content-list-auto-load-more";

import getVideoItemTopTags from "@/utils/get-video-item-top-tags";

// ============================================================================

type StatusType = "ready" | "loading" | "complete" | "error";
type ItemType = Partial<VideoItemType> &
    Pick<VideoItemType, "_id" | "title" | "release" | "cover">;
type Props = {
    type?: VideoListPageTypesType | "search";
    slug?: string;
    /**
     * 当前是否是“首页”型
     *  - 决定“标签”内容类型
     */
    isIndex?: boolean;
    /** 每次请求的内容长度，即传统概念上的每页条目数 */
    length?: number;
    initialList?: ItemType[];
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
    tagPurpose?: Parameters<typeof getVideoItemTopTags>[1];
};

// ============================================================================

const VideoListGrid: FC<Props> = ({
    type,
    slug,
    isIndex: _isIndex,
    length = 20,
    initialList = [] as ItemType[],
    initialListIsComplete = false,
    infiniteScroll: _infiniteScroll = false,
    defaultContentListAutoLoadMore,
    showLoadMoreButton = true,
    tagPurpose,
}) => {
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

    /**
     * 当前是否是“首页”型
     *  - 决定“标签”内容类型
     */
    const isIndex = useMemo(
        () => (typeof _isIndex === "boolean" ? _isIndex : !type),
        [_isIndex, type],
    );
    /**
     * 是否允许自动加载更多内容，或称“无限滚动”
     */
    const infiniteScroll = useMemo(
        () => _infiniteScroll && contentListAutoLoadMore === "1",
        [_infiniteScroll, contentListAutoLoadMore],
    );

    const loadMore = useCallback(
        ({ from }: { from: number }) => {
            return (
                type === "search"
                    ? actions.search.query({
                          keyword: slug || "",
                          from,
                          length,
                      })
                    : actions.videoListPage.fetchList({
                          filters:
                              type && slug
                                  ? [
                                        {
                                            type,
                                            slug,
                                        },
                                    ]
                                  : undefined,
                          from,
                          length,
                      })
            ).then((res) => res.data);
        },
        [type, slug, length],
    );

    /**
     * 获取要显示的“标签”
     *  - 根据列表类型 `type` 和 `slug` 属性，以及 `tagPurpose` 属性决定
     *  - 基于 `getVideoItemTopTags` 工具函数
     */
    const getTags = useCallback(
        (post: (typeof initialList)[0]) => {
            if (tagPurpose && ["latest", "search-result"].includes(tagPurpose))
                return getVideoItemTopTags(post, tagPurpose);
            if (isIndex) return getVideoItemTopTags(post, "latest");
            else if (
                tagPurpose === "news" ||
                (type === "tag" && slug === "news")
            )
                return getVideoItemTopTags(post, "news");
            else if (
                tagPurpose === "tutorial" ||
                (type === "tag" && slug === "tutorial")
            )
                return getVideoItemTopTags(post, "tutorial");
            else if (
                tagPurpose === "review" ||
                (type === "tag" && slug === "review")
            )
                return getVideoItemTopTags(post, "review");
            else if (
                tagPurpose === "preview" ||
                (type === "tag" && slug === "preview")
            )
                return getVideoItemTopTags(post, "preview");
            else if (
                tagPurpose === "world" ||
                (type === "tag" && slug === "world")
            )
                return getVideoItemTopTags(post, "world");
            else if (
                tagPurpose === "chat" ||
                (type === "tag" && slug === "chat")
            )
                return getVideoItemTopTags(post, "chat");
            else if (
                tagPurpose === "short" ||
                (type === "tag" && slug === "short")
            )
                return getVideoItemTopTags(post, "short");
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
                return getVideoItemTopTags(post, "latest");

            return undefined;
        },
        [type, slug, isIndex, tagPurpose],
    );

    const itemRender = useMemo<FC<ItemType>>(
        () => (post: ItemType) => {
            return (
                <VideoItem
                    _id={post._id}
                    slug={post.slug}
                    title={post.title}
                    cover={post.cover}
                    duration={post.duration}
                    links={post.links}
                    tags={getTags(post)}
                    infos={[new Date(post.release)]}
                />
            );
        },
        [getTags],
    );

    return (
        <ListContainerGrid<
            ItemType,
            | Awaited<ReturnType<typeof actions.search.query>>["data"]
            | Awaited<
                  ReturnType<typeof actions.videoListPage.fetchList>
              >["data"]
        >
            loadMore={loadMore}
            itemRender={itemRender}
            length={length}
            initialList={initialList}
            initialListIsComplete={initialListIsComplete}
            infiniteScroll={infiniteScroll}
            defaultContentListAutoLoadMore={defaultContentListAutoLoadMore}
            showLoadMoreButton={showLoadMoreButton}
        />
    );
};

export default memo(VideoListGrid);
