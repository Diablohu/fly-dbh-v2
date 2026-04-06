import {
    useState,
    useCallback,
    useEffect,
    useRef,
    type FC,
    type SubmitEventHandler,
} from "react";
import { actions, type ActionError } from "astro:actions";
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
import ResultRandom from "./result-random.tsx";

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
    const FormContainerRef = useRef<HTMLFormElement>(null);
    const ScrollToRef = useRef<HTMLDivElement>(null);
    const NeedScrollBackRef = useRef(false);

    const { isSticky, ProbeRef } = useSticky({
        ContainerRef: FormContainerRef,
        cssVariableNameExtraTop: "--sticky-extra-top",
    });

    const [status, setStatus] = useState<StatusType>("pending");
    const [error, setError] = useState<string>();
    const [queryType, setQueryType] = useState<"list" | "random">("list");
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
    const [queryTimestamp, setQueryTimestamp] = useState<number>(-1);

    const onSubmit = useCallback<SubmitEventHandler<HTMLFormElement>>(
        async (evt) => {
            evt.preventDefault();
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
            setQueryType("list");
            setStatus("loading");
            // console.log(ScrollToRef.current?.offsetTop);
            fetchAction({ sort: "difficulty", ...newConditions }).then(
                ({ data, error }) => {
                    setQueryType("list");
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
        if (!FormContainerRef.current) return;
        const formData = new FormData(FormContainerRef.current);
        setError("");
        setQueryType("random");
        setStatus("loading");
        actions.challengePage
            .fetchRandomItem({
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
            })
            .then(({ data, error }) => {
                setQueryType("random");
                if (!data || (error && "status" in error)) {
                    const err = error as ActionError;
                    setStatus("error");
                    if (err.status === 404)
                        return setResults({
                            list: [],
                            total: 0,
                            page: 1,
                        });
                    setError(`${error?.status} ${error?.code}`);
                    return;
                }
                setResults({
                    list: [data],
                    total: 1,
                    page: 1,
                });
                setStatus("ready");
            })
            .catch((err) => {
                console.log(err);
            });
        // alert("开发中……");
    }, []);

    useEffect(() => {
        return setStatus("ready");
    }, []);

    useEffect(() => {
        setQueryTimestamp(Date.now());
    }, [results]);

    useEffect(() => {
        if (status === "loading" && isSticky) {
            NeedScrollBackRef.current = true;
        }
        if (status === "ready" && NeedScrollBackRef.current) {
            // console.log(
            //     ScrollToRef.current?.offsetTop,
            //     ProbeRef.current?.offsetTop,
            //     ProbeRef.current?.getBoundingClientRect()?.top,
            //     FormContainerRef.current?.getBoundingClientRect()?.top,
            //     FormContainerRef.current?.getBoundingClientRect()?.height,
            //     window.scrollY,
            // );
            window.scrollTo({
                top:
                    ScrollToRef.current?.offsetTop! +
                    ProbeRef.current?.offsetTop! -
                    FormContainerRef.current?.offsetHeight! / 2,
                behavior: "smooth",
            });
            // window.scrollTo({
            //     top:
            //         ScrollToRef.current?.offsetTop! +
            //         FormContainerRef.current?.getBoundingClientRect()?.top! -
            //         FormContainerRef.current?.getBoundingClientRect()?.height!,
            //     behavior: "smooth",
            // });
            NeedScrollBackRef.current = false;
        }
    }, [status, isSticky]);

    return (
        <>
            <form
                className={classNames(styles["form"], {
                    [styles["is-sticky"]]: isSticky,
                })}
                method="GET"
                onSubmit={onSubmit}
                ref={FormContainerRef}
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
                            label: hazard.name,
                            value: hazard._id,
                            difficulty: hazard.difficulty,
                            emoji: hazard.emoji,
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
                    {/* // TODO: unlock `抽选` */}
                    {import.meta.env.DEV && (
                        <TagButton
                            type="button"
                            disabled={status === "loading"}
                            onClick={onDraw}
                        >
                            抽选
                        </TagButton>
                    )}
                </section>
            </form>
            <div ref={ScrollToRef} />
            {status === "error" && <div>{error}</div>}
            {status === "loading" ? (
                <span className={styles["loading-spinner"]} />
            ) : queryType === "list" && typeof results?.total === "number" ? (
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
            ) : queryType === "random" && typeof results?.total === "number" ? (
                <ResultRandom key={queryTimestamp} result={results} />
            ) : (
                <div className={styles["no-initial-condition"]}>
                    <strong>请选择筛选条件</strong>
                </div>
            )}
        </>
    );
};
export default SearchFormAndResult;
