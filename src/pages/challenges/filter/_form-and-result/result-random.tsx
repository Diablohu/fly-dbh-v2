import { memo, type FC } from "react";
import { actions } from "astro:actions";

import ChallengeItem from "@/components/challenge-item";
import getChallengePageLink from "@/utils/get-challenge-page-link";

import styles from "./index.module.less";

// ============================================================================

const actionFetchList = actions.challenge.fetchList;

// ============================================================================
//
// #region React Component
//
// ============================================================================

const ResultRandom: FC<{
    result: Awaited<ReturnType<typeof actionFetchList>>["data"];
}> = ({ result }) => {
    if (Array.isArray(result?.list) && result.list.length > 0)
        return (
            <div className={styles["random-result"]}>
                <ChallengeItem
                    className={styles["item"]}
                    // classNameHazards={styles["hazards"]}
                    item={result.list[0]}
                    showAircraftTypes
                    showHazards
                />
                <section className={styles["extra-infos"]}>
                    {!result.list[0].airac_cyle && (
                        <span className={styles["article-is-wip"]}>
                            该条目内容正在完善中……
                        </span>
                    )}
                    <a
                        className={styles["hint-link"]}
                        href={getChallengePageLink(
                            result.list[0].slug || result.list[0]._id,
                        )}
                    >
                        查阅：示例航线 & 航图解说
                    </a>
                </section>
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
