import {
    useCallback,
    useMemo,
    memo,
    type FC,
    type ComponentProps,
    type HTMLAttributes,
} from "react";
import classNames from "classnames";
import { actions } from "astro:actions";
import {
    type ChallengeListItemType,
    type ValidContentListAutoLoadMoreType,
    type AircraftTypes,
} from "@/types";

import ListContainerGrid from "@/components/list-container-grid";
import ChallengeItem from "@/components/challenge-item";

import styles from "./challenge-list-grid.module.less";

// ============================================================================

type Props = {
    catalog: "latest" | AircraftTypes;
    /** 每次请求的内容长度，即传统概念上的每页条目数 */
    length?: number;
    initialList?: ChallengeListItemType[];
    /**
     * 初始列表是否已完成（已没有更多内容）
     * @default false
     */
    initialListIsComplete?: boolean;
    /**
     * 是否启用无限滚动（自动加载更多内容）功能
     *  - 注！如需启用，则 **必须** 传入 `defaultContentListAutoLoadMore`
     * @default false
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
} & Pick<
    ComponentProps<typeof ChallengeItem>,
    "showMaxCategory" | "showAircraftTypes"
> &
    Pick<HTMLAttributes<HTMLDivElement>, "className">;

// ============================================================================

const ChallengeListGrid: FC<Props> = ({
    className,
    catalog,
    length = 20,
    initialList = [] as ChallengeListItemType[],
    initialListIsComplete = false,
    infiniteScroll = false,
    defaultContentListAutoLoadMore,
    showLoadMoreButton = true,
    showMaxCategory = false,
    showAircraftTypes = false,
}) => {
    if (
        infiniteScroll &&
        typeof defaultContentListAutoLoadMore === "undefined"
    ) {
        throw new Error(
            `Props "defaultContentListAutoLoadMore" is required for React Component "ChallengeListGrid"`,
        );
    }

    const loadMore = useCallback(
        ({ from }: { from: number }) => {
            return actions.challengePage
                .fetchList({
                    from,
                    length,
                    sort: catalog === "latest" ? "latest" : "difficulty",
                    types: catalog === "latest" ? undefined : [catalog],
                })
                .then((res) => res.data);
        },
        [catalog, length],
    );

    const itemRender = useMemo<FC<ChallengeListItemType>>(
        () => (post: ChallengeListItemType) => {
            return (
                <ChallengeItem
                    key={post._id}
                    // className={classNameItem}
                    item={post}
                    showMaxCategory={showMaxCategory}
                    showAircraftTypes={showAircraftTypes}
                />
            );
        },
        [showMaxCategory, showAircraftTypes],
    );

    return (
        <ListContainerGrid<
            ChallengeListItemType,
            Awaited<ReturnType<typeof actions.challengePage.fetchList>>["data"]
        >
            className={classNames(styles["challenge-list-grid"], className)}
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

export default memo(ChallengeListGrid);
