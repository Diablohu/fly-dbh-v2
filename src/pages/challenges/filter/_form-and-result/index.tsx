import {
    useState,
    useCallback,
    useEffect,
    useRef,
    type FC,
    type SubmitEventHandler,
} from "react";
import { actions } from "astro:actions";
import classNames from "classnames";

import {
    type ChallengeDifficultyType,
    type AircraftTypes,
    type ValidContentListAutoLoadMoreType,
} from "@/types";
import {
    challengeDifficultyString,
    aircraftTypeString,
    getChallengeCatalogPageLink,
} from "@/global";

import useSticky from "@/react-hooks/use-sticky";

import TagButton from "@/components/tag-button";

import Filter from "./filter.tsx";
import Results from "./results.tsx";

import { toString as conditionsToString } from "../_query";

import styles from "./index.module.less";

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
    defaultContentListAutoLoadMore: ValidContentListAutoLoadMoreType;
}> = ({
    // length,
    hazards,

    initialDifficulties,
    initialTypes,
    initialHazards,
    initialResult,
    noInitialCondition,

    defaultContentListAutoLoadMore,
}) => {
    const ContainerRef = useRef<HTMLFormElement>(null);
    const ScrollToRef = useRef<HTMLDivElement>(null);

    const { isSticky } = useSticky({
        ContainerRef,
        cssVariableNameExtraTop: "--sticky-extra-top",
    });

    const [status, setStatus] = useState<StatusType>("pending");
    const [error, setError] = useState<string>();
    const [results, setResults] =
        useState<Awaited<ReturnType<typeof fetchAction>>["data"]>(
            initialResult,
        );
    const [conditions, setConditions] = useState<
        | {
              difficulties: Parameters<
                  typeof actions.challengePage.fetchList
              >[0]["difficulties"];
              types: Parameters<
                  typeof actions.challengePage.fetchList
              >[0]["types"];
              hazards: Parameters<
                  typeof actions.challengePage.fetchList
              >[0]["hazards"];
          }
        | undefined
    >(
        noInitialCondition
            ? undefined
            : {
                  difficulties: initialDifficulties,
                  types: initialTypes,
                  hazards: initialHazards,
              },
    );
    const [queryTimestamp, setQueryTimestamp] = useState<number>(Date.now());

    const onSubmit = useCallback<SubmitEventHandler<HTMLFormElement>>(
        async (evt) => {
            evt.preventDefault();
            console.log(status);
            if (status === "pending") return;
            if (status === "loading") return;

            const formData = new FormData(evt.currentTarget);
            // console.log(...formData.entries());

            const newConditions = {
                difficulties: formData
                    .getAll("difficulties")
                    .filter(Boolean)
                    .map((value) =>
                        Number(value),
                    ) as Array<ChallengeDifficultyType>,
                types: formData
                    .getAll("aircraftTypes")
                    .filter(Boolean) as Array<AircraftTypes>,
                hazards: formData
                    .getAll("hazards")
                    .filter(Boolean) as Array<string>,
            };
            setConditions(newConditions);

            window.history.replaceState(
                window.history.state,
                "",
                [
                    getChallengeCatalogPageLink("filter"),
                    conditionsToString(newConditions),
                ]
                    .filter(Boolean)
                    .join("/"),
            );

            setError("");
            setStatus("loading");
            // console.log(ScrollToRef.current?.offsetTop);
            // window.scrollTo({
            //     top: ScrollToRef.current?.offsetTop,
            //     behavior: "smooth",
            // });
            fetchAction({ sort: "difficulty", ...newConditions }).then(
                ({ data, error }) => {
                    // if (res.status !== 200) {
                    //     setStatus("error");
                    //     setError(`Error: ${res.status} ${res.statusText}`);
                    //     return;
                    // }
                    if (!data || error) {
                        setStatus("error");
                        setError(`${error?.status} ${error?.code}`);
                        return;
                    }

                    // logSearch("Fetched results %O", data);
                    setResults(data);
                    setStatus("ready");
                },
            );
        },
        [status],
    );

    const onDraw = useCallback(() => {
        alert("开发中……");
    }, []);

    useEffect(() => {
        return setStatus("ready");
    }, []);

    useEffect(() => {
        setQueryTimestamp(Date.now());
    }, [results]);

    return (
        <>
            <form
                className={classNames(styles["form"], {
                    [styles["is-sticky"]]: isSticky,
                })}
                method="GET"
                onSubmit={onSubmit}
                ref={ContainerRef}
            >
                <Filter
                    label="难度"
                    name="difficulties"
                    options={Object.keys(challengeDifficultyString)
                        .sort((a, b) => Number(b) - Number(a))
                        .map((difficulty) => {
                            const value = Number(
                                difficulty,
                            ) as ChallengeDifficultyType;
                            return {
                                label: challengeDifficultyString[value],
                                value: value,
                                difficulty: value,
                            };
                        })}
                    initialValue={initialDifficulties}
                    disabled={status === "loading"}
                />
                <Filter
                    label="机型"
                    name="aircraftTypes"
                    options={Object.entries(aircraftTypeString).map(
                        ([value, label]) => ({ label, value }),
                    )}
                    initialValue={initialTypes}
                    disabled={status === "loading"}
                />
                <Filter
                    label="灾害"
                    name="hazards"
                    options={
                        hazards?.map((hazard) => ({
                            label: `${hazard.emoji} ${hazard.name}`,
                            value: hazard._id,
                            difficulty: hazard.difficulty,
                        })) || []
                    }
                    initialValue={initialHazards}
                    multiple
                    disabled={status === "loading"}
                />
                <section className={styles["actions"]}>
                    <TagButton type="submit" disabled={status === "loading"}>
                        查询
                    </TagButton>
                    <TagButton
                        type="button"
                        disabled={status === "loading"}
                        onClick={onDraw}
                    >
                        抽选
                    </TagButton>
                </section>
            </form>
            <div ref={ScrollToRef} />
            {status === "error" && <div>{error}</div>}
            {status === "loading" ? (
                <span className={styles["loading-spinner"]} />
            ) : typeof results?.total === "number" ? (
                <Results
                    key={queryTimestamp}
                    conditionDifficulties={conditions?.difficulties}
                    conditionTypes={conditions?.types}
                    conditionHazards={conditions?.hazards}
                    results={results}
                    defaultContentListAutoLoadMore={
                        defaultContentListAutoLoadMore
                    }
                />
            ) : (
                <div className={styles["no-initial-condition"]}>
                    <strong>请选择筛选条件</strong>
                </div>
            )}
        </>
    );
};
export default SearchFormAndResult;
