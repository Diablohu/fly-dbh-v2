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
    type ChallengeListQueryConditionType,
    type AircraftTypes,
} from "@/types";

import ListContainerGrid from "@/components/list-container-grid";
import ChallengeItem from "@/components/challenge-item";

import styles from "./challenge-list-grid.module.less";

// ============================================================================

const actionFetchList = actions.challenge.fetchList;
const ListContainer = ListContainerGrid<
    ChallengeListItemType,
    Awaited<ReturnType<typeof actionFetchList>>["data"]
>;

// ============================================================================

type Props = {
    catalog: "latest" | "filter" | "no-airac" | AircraftTypes;
    initialList?: ChallengeListItemType[];

    /**
     * 条件：难度
     * - 没有表示**全部**
     */
    conditionDifficulties?: Parameters<
        typeof actionFetchList
    >[0]["difficulties"];
    /**
     * 条件：机型
     * - 没有表示**全部**
     */
    conditionTypes?: Parameters<typeof actionFetchList>[0]["types"];
    /**
     * 条件：难点灾害
     * - 没有表示**全部**
     */
    conditionHazards?: Parameters<typeof actionFetchList>[0]["hazards"];
} & Pick<
    ComponentProps<typeof ChallengeItem>,
    "showMaxCategory" | "showAircraftTypes"
> &
    Partial<ChallengeListQueryConditionType> &
    Pick<
        ComponentProps<typeof ListContainer>,
        | "initialListIsComplete"
        | "infiniteScroll"
        | "defaultContentListAutoLoadMore"
        | "showLoadMoreButton"
        | "showCompleteText"
    > &
    Pick<HTMLAttributes<HTMLDivElement>, "className">;

// ============================================================================

const ChallengeListGrid: FC<Props> = ({
    className,
    catalog,
    length = 20,
    sort,
    initialList = [] as ChallengeListItemType[],
    initialListIsComplete = false,
    infiniteScroll = false,
    defaultContentListAutoLoadMore,
    showLoadMoreButton = true,
    showCompleteText,
    showMaxCategory = false,
    showAircraftTypes = false,
    conditionDifficulties,
    conditionTypes,
    conditionHazards,
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
        async ({ from }: { from: number }) => {
            return actionFetchList({
                from,
                length,
                sort: sort ?? (catalog === "latest" ? "latest" : "difficulty"),
                types: conditionTypes
                    ? conditionTypes
                    : catalog === "latest" ||
                        catalog === "filter" ||
                        catalog === "no-airac"
                      ? undefined
                      : [catalog],
                difficulties: conditionDifficulties,
                hazards: conditionHazards,
            }).then((res) => res.data);
        },
        [
            catalog,
            length,
            sort,
            conditionDifficulties,
            conditionTypes,
            conditionHazards,
        ],
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
        <ListContainer
            className={classNames(styles["challenge-list-grid"], className)}
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

export default memo(ChallengeListGrid);
