import {
    useCallback,
    useMemo,
    memo,
    type FC,
    type ComponentProps,
} from "react";
import { actions } from "astro:actions";
import { type VideoListPageTypesType, type VideoItemType } from "@/types";

import ListContainerGrid from "@/components/list-container-grid";
import VideoItem from "@/components/video-item";

import getVideoItemTopTags from "@/utils/get-video-item-top-tags";

// ============================================================================

const ListContainer = ListContainerGrid<
    ItemType,
    | Awaited<ReturnType<typeof actions.search.query>>["data"]
    | Awaited<ReturnType<typeof actions.videoListPage.fetchList>>["data"]
>;

// ============================================================================

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
    /**
     * 每次请求的内容长度，即传统概念上的每页条目数
     * @default 20
     */
    length?: number;
    initialList?: ItemType[];
    /**
     * **强制** 指定是否显示标签，如果显示，确定显示的“目的”类型
     */
    tagPurpose?: Parameters<typeof getVideoItemTopTags>[1];
    /**
     * 优先级设置：对于列表中的前 N 个条目，使用更高优先级的资源加载（如封面图）
     * - 如果传入 `true`，默认 N 值为 10
     */
    allowAssetPriorityHigh?: number | boolean;
} & Pick<
    ComponentProps<typeof ListContainer>,
    | "initialListIsComplete"
    | "infiniteScroll"
    | "defaultContentListAutoLoadMore"
    | "showLoadMoreButton"
    | "showCompleteText"
>;

// ============================================================================

const VideoListGrid: FC<Props> = ({
    type,
    slug,
    isIndex: _isIndex,
    length = 20,
    initialList = [] as ItemType[],
    initialListIsComplete = false,
    infiniteScroll = false,
    defaultContentListAutoLoadMore,
    showLoadMoreButton = true,
    tagPurpose,
    allowAssetPriorityHigh = false,
    showCompleteText,
}) => {
    if (
        infiniteScroll &&
        typeof defaultContentListAutoLoadMore === "undefined"
    ) {
        throw new Error(
            `Props "defaultContentListAutoLoadMore" is required for React Component "VideoListGrid"`,
        );
    }

    /**
     * 当前是否是“首页”型
     *  - 决定“标签”内容类型
     */
    const isIndex = useMemo(
        () => (typeof _isIndex === "boolean" ? _isIndex : !type),
        [_isIndex, type],
    );

    const loadMore = useCallback(
        async ({ from }: { from: number }) => {
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

    const itemRender = useMemo<
        ComponentProps<typeof ListContainer>["itemRender"]
    >(
        () => (post) => {
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
                    assetPriority={
                        allowAssetPriorityHigh === true && post._index < 10
                            ? "high"
                            : typeof allowAssetPriorityHigh === "number" &&
                                post._index < allowAssetPriorityHigh
                              ? "high"
                              : undefined
                    }
                />
            );
        },
        [getTags, length, allowAssetPriorityHigh],
    );

    return (
        <ListContainer
            loadMore={loadMore}
            itemRender={itemRender}
            length={length}
            initialList={initialList}
            initialListIsComplete={initialListIsComplete}
            infiniteScroll={infiniteScroll}
            defaultContentListAutoLoadMore={defaultContentListAutoLoadMore}
            showLoadMoreButton={showLoadMoreButton}
            showCompleteText={showCompleteText}
        />
    );
};

export default memo(VideoListGrid);
