import { memo, type FC } from "react";
import { actions } from "astro:actions";

import ChallengeItem from "@/components/challenge-item";

import styles from "./index.module.less";

// ============================================================================

const fetchAction = actions.challengePage.fetchList;

// ============================================================================
//
// #region React Component
//
// ============================================================================

const ResultRandom: FC<{
    result: Awaited<ReturnType<typeof fetchAction>>["data"];
}> = ({ result }) => {
    if (Array.isArray(result?.list) && result.list.length > 0)
        return (
            <div className={styles["random-result"]}>
                <ChallengeItem
                    className={styles["item"]}
                    item={result.list[0]}
                    showAircraftTypes
                />
            </div>
        );

    return (
        <div className={styles["no-result"]}>
            <strong>查询无结果</strong>
            <p>请尝试其他条件</p>
        </div>
    );
};

export default memo(ResultRandom);
