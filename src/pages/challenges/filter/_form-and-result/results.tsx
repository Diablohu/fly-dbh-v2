import { memo, type FC } from "react";
import { actions } from "astro:actions";

import { type ValidContentListAutoLoadMoreType } from "@/types";

import ChallengeListGrid from "@/components/challenge-list-grid";

import styles from "./index.module.less";

// ============================================================================

const fetchAction = actions.challengePage.fetchList;

// ============================================================================
//
// #region React Component
//
// ============================================================================

const Results: FC<{
    /**
     * 条件：难度
     * - 没有表示**全部**
     */
    conditionDifficulties?: Parameters<
        typeof actions.challengePage.fetchList
    >[0]["difficulties"];
    /**
     * 条件：机型
     * - 没有表示**全部**
     */
    conditionTypes?: Parameters<
        typeof actions.challengePage.fetchList
    >[0]["types"];
    /**
     * 条件：难点灾害
     * - 没有表示**全部**
     */
    conditionHazards?: Parameters<
        typeof actions.challengePage.fetchList
    >[0]["hazards"];
    results: Awaited<ReturnType<typeof fetchAction>>["data"];
    defaultContentListAutoLoadMore: ValidContentListAutoLoadMoreType;
}> = ({
    conditionDifficulties,
    conditionTypes,
    conditionHazards,
    results,
    defaultContentListAutoLoadMore,
}) => {
    if (Array.isArray(results?.list) && results.list.length > 0)
        return (
            <ChallengeListGrid
                catalog="filter"
                sort="difficulty"
                initialList={results?.list}
                initialListIsComplete={results.list.length >= results.total}
                conditionDifficulties={conditionDifficulties}
                conditionTypes={conditionTypes}
                conditionHazards={conditionHazards}
                infiniteScroll
                defaultContentListAutoLoadMore={defaultContentListAutoLoadMore}
                showLoadMoreButton
                showAircraftTypes
            />
        );

    return (
        <div className={styles["no-result"]}>
            <strong>查询无结果</strong>
            <p>请尝试其他条件</p>
        </div>
    );
};

export default memo(Results);
