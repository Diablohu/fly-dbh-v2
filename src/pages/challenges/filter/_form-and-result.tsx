import {
    useState,
    useCallback,
    // useEffect,
    // useMemo,
    // useRef,
    // Fragment,
    type FC,
    type SubmitEventHandler,
} from "react";
import { actions } from "astro:actions";

import ChallengeListGrid from "@/components/challenge-list-grid";

// import { toString as conditionToString } from "./_query";

import styles from "./_form-and-result.module.less";

// ============================================================================

type StatusType = "pending" | "ready" | "loading" | "error";
const fetchAction = actions.challengePage.fetchList;

// ============================================================================
//
// #region React Component
//
// ============================================================================

const SearchFormAndResult: FC<{
    hazards: Awaited<
        ReturnType<typeof actions.challengePage.fetchHazards>
    >["data"];
    length: number;

    /**
     * 初始条件：难度
     * - 没有表示**全部**
     */
    initialDifficulties: Parameters<
        typeof actions.challengePage.fetchList
    >[0]["difficulties"];
    /**
     * 初始条件：机型
     * - 没有表示**全部**
     */
    initialTypes: Parameters<
        typeof actions.challengePage.fetchList
    >[0]["types"];
    /**
     * 初始条件：难点灾害
     * - 没有表示**全部**
     */
    initialHazards: Parameters<
        typeof actions.challengePage.fetchList
    >[0]["hazards"];
    initialResult?: Awaited<ReturnType<typeof fetchAction>>["data"];
    noInitialCondition?: boolean;
}> = ({
    // length,
    // hazards,

    // initialDifficulties,
    // initialTypes,
    // initialHazards,
    initialResult,
    noInitialCondition,
}) => {
    const [status /*, setStatus*/] = useState<StatusType>("pending");
    const [error /*, setError*/] = useState<string>();
    const [results /*, setResults*/] =
        useState<Awaited<ReturnType<typeof fetchAction>>["data"]>(
            initialResult,
        );

    const onSubmit = useCallback<SubmitEventHandler<HTMLFormElement>>(
        async (evt) => {
            evt.preventDefault();
            if (status === "pending") return;
            if (status === "loading") return;
        },
        [status],
    );

    return (
        <>
            <form className={styles["form"]} method="GET" onSubmit={onSubmit}>
                <Condition label="难度" name="difficulties" />
                <Condition label="机型" name="aircraftTypes" />
                <Condition label="灾害" name="hazards" multiple />
                <section className={styles["actions"]}>
                    <button type="submit" disabled={status === "loading"}>
                        查询
                    </button>
                    <button type="button" disabled={status === "loading"}>
                        抽选
                    </button>
                </section>
            </form>
            {status === "error" && <div>{error}</div>}
            {noInitialCondition ? (
                <img
                    src="/sanity-images/00ef50cf5f3e039ccd76334357180690289b49c2-2560x1440.png?fm-webp&w=1280&q=50"
                    style={{
                        display: "block",
                        width: "100%",
                    }}
                />
            ) : typeof results?.total === "number" && results?.total === 0 ? (
                <ChallengeListGrid
                    catalog="filter"
                    initialList={results?.list}
                />
            ) : (
                <div className={styles["no-result"]}>
                    <strong>查询无结果</strong>
                </div>
            )}
        </>
    );
};
export default SearchFormAndResult;

// #endregion
// ============================================================================
//
// #region <Condition/>
//
// ============================================================================

const Condition: FC<{
    label: string;
    name: "aircraftTypes" | "difficulties" | "hazards";
    multiple?: boolean;
}> = ({ label /*, name*/, multiple }) => {
    return (
        <section className={styles["condition"]}>
            <strong>
                {label}
                {multiple && <small>（可多选）</small>}
            </strong>
            {/* ALL | Options */}
        </section>
    );
};
