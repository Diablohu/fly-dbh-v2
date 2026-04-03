import {
    useState,
    useCallback,
    // useEffect,
    useMemo,
    useRef,
    // Fragment,
    type FC,
    type SubmitEventHandler,
    type ChangeEventHandler,
    type MouseEventHandler,
} from "react";
import { actions } from "astro:actions";
import classNames from "classnames";

import { type ChallengeDifficultyType } from "@/types";
import { challengeDifficultyString, aircraftTypeString } from "@/global";

import useSticky from "@/react-hooks/use-sticky";

import TagButton from "@/components/tag-button";
import ChallengeListGrid from "@/components/challenge-list-grid";
import Menu, { MenuItem, MenuLineItem } from "@/components/menu";

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
    hazards,

    initialDifficulties,
    initialTypes,
    initialHazards,
    initialResult,
    noInitialCondition,
}) => {
    const ContainerRef = useRef<HTMLFormElement>(null);

    const { isSticky } = useSticky({
        ContainerRef,
        cssVariableNameExtraTop: "--sticky-extra-top",
    });

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
                        .sort()
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
                    <TagButton type="button" disabled={status === "loading"}>
                        抽选
                    </TagButton>
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
// #region <Filter/>
//
// ============================================================================

const Filter: FC<{
    label: string;
    name: "aircraftTypes" | "difficulties" | "hazards";
    options: Array<{
        label: string;
        value: string | number;
        difficulty?: ChallengeDifficultyType;
    }>;
    initialValue?: Array<string | number>;
    multiple?: boolean;
    disabled?: boolean;
}> = ({
    label,
    name,
    options: _options,
    initialValue,
    multiple = false,
    disabled = false,
}) => {
    const inputType = useMemo(
        () => (multiple ? "checkbox" : "radio"),
        [multiple],
    );
    const options = useMemo(
        () =>
            _options.map((option) => ({
                id: `__challenge|filter|${name}|${option.value}`,
                ...option,
            })),
        [_options],
    );
    const optionIdAll = useMemo(
        () => `__challenge|filter|${name}|!!all!!`,
        [name],
    );
    // console.log({ initialValue, options });

    const [showMenu, setShowMenu] = useState(false);

    const onClick = useCallback(() => {
        if (disabled) return;
        setShowMenu((showMenu) => !showMenu);
    }, [disabled]);

    const onInputClick = useCallback<MouseEventHandler<HTMLInputElement>>(
        (evt) => {
            evt.stopPropagation();
        },
        [],
    );
    const onValueChange = useCallback<
        ChangeEventHandler<HTMLInputElement, HTMLInputElement>
    >(
        (evt) => {
            if (inputType === "radio") return;

            const isAllOption = !evt.target.value;

            // 对于 `checkbox` 类型，`全部` 选项被取消选中时，强制保持选中状态
            if (isAllOption && !evt.target.checked) evt.target.checked = true;

            // 对于 `checkbox` 类型，`全部` 选项被选中时，取消所有非 `全部` 选项的选中状态
            if (isAllOption && evt.target.checked) {
                options.forEach((option) => {
                    const optionInput = document.getElementById(
                        option.id,
                    ) as HTMLInputElement;
                    if (optionInput) optionInput.checked = false;
                });
            }

            // 对于 `checkbox` 类型，若有任何一个非 `全部` 选项被选中时，强制取消 `全部` 选项的选中状态
            if (!isAllOption && evt.target.checked) {
                const allOption = document.getElementById(
                    optionIdAll,
                ) as HTMLInputElement;
                if (allOption) allOption.checked = false;
            }

            // 对于 `checkbox` 类型，若所有非 `全部` 选项被选中时，强制选中 `全部` 选项，所有非 `全部` 选项取消选中状态
            if (
                !isAllOption &&
                evt.target.checked &&
                options.every((option) => {
                    const optionInput = document.getElementById(
                        option.id,
                    ) as HTMLInputElement;
                    return optionInput ? optionInput.checked : false;
                })
            ) {
                const allOption = document.getElementById(
                    optionIdAll,
                ) as HTMLInputElement;
                if (allOption) {
                    allOption.checked = true;
                    options.forEach((option) => {
                        const optionInput = document.getElementById(
                            option.id,
                        ) as HTMLInputElement;
                        if (optionInput) optionInput.checked = false;
                    });
                }
            }
        },
        [name, inputType, options, optionIdAll],
    );
    /**
     * LABEL:
     *     All
     *     Option 1, Option 2, Opt.....
     *
     * OPTIONS:
     * [√] ALL
     * ---
     * [O] Option 1
     * [O] Option 2
     */
    return (
        <section
            className={classNames([
                styles["filter"],
                {
                    "is-menu-open": showMenu,
                },
            ])}
            onClick={onClick}
        >
            <input
                id={optionIdAll}
                type={inputType}
                name={name}
                value=""
                defaultChecked={!initialValue || initialValue.length === 0}
                onChange={onValueChange}
                onClick={onInputClick}
            />
            {options.map(({ id, value }) => (
                <input
                    key={id}
                    id={id}
                    type={inputType}
                    name={name}
                    value={value}
                    defaultChecked={initialValue?.includes(value)}
                    onChange={onValueChange}
                    onClick={onInputClick}
                />
            ))}
            <span className={styles["label"]}>
                {label}
                {/* {multiple && <small>（可多选）</small>} */}
            </span>
            <span className={styles["current"]}>AAAAAA</span>
            {/* <section className={styles["options"]}>
                <label htmlFor={optionIdAll} className={styles["option"]}>
                    <em className={styles["indicator"]} />
                    全部
                </label>
            </section> */}
            {/* ALL | Options */}
            <Menu
                open={showMenu}
                setOpenState={setShowMenu}
                anchorPoint="bottomRight"
                grow={["down", "left"]}
                // onOpen={onMenuOpen}
                // stickyTitle={title}
            >
                <MenuItem className={styles["option"]}>
                    <label htmlFor={optionIdAll} className={styles["label"]}>
                        <em className={styles["indicator"]} />
                        全部
                    </label>
                </MenuItem>
                <MenuLineItem />
                {options.map(({ id, label, value, difficulty }) => (
                    <MenuItem key={id} className={styles["option"]}>
                        <label htmlFor={id} className={styles["label"]}>
                            {label}
                        </label>
                    </MenuItem>
                ))}
            </Menu>
        </section>
    );
};
