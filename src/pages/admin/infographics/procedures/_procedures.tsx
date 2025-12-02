import { useState, useMemo, useCallback, useEffect, type FC } from "react";
import classNames from "classnames";

import useViewType from "../_use-view-type";
import TagButton from "@/components/tag-button";

import styles from "./_procedures.module.less";

// ============================================================================

/**
 * 如果第 2 个元素是数组，表示没有连接线的多行文本
 */
export type ProcedureItemType =
    | string
    | [string, string]
    | [string, string, string]
    | [undefined, string[]]
    | [{ ident: number }, string]
    | [{ ident: number }, string[]]
    | [{ ident: number }, string, string]
    | [{ ident: number }, string, string, string];

const searchParamIndex = "step";

// ============================================================================

const Procedures: FC<{
    title: string;
    procedures: {
        step: string;
        list: ProcedureItemType[];
    }[];

    /**
     * 初始显示的步骤
     * - 优先级高于 `initialUrl`
     */
    initialIndex?: number;
    /**
     * 用以计算初始显示的步骤的初始 URL
     * - 如果存在 `initialIndex`，则忽视该属性
     */
    initialUrl?: string;
}> = ({ title, procedures, initialIndex, initialUrl }) => {
    const [viewType] = useViewType();
    const [currentStepIndex, setCurrentStepIndex] = useState(
        (typeof initialIndex === "number"
            ? initialIndex
            : typeof initialUrl === "string"
              ? Number(
                    new URL(initialUrl).searchParams.get(searchParamIndex)
                ) || 0
              : 0) || 0
    );
    const currentProcedure = useMemo(() => {
        return procedures[currentStepIndex];
    }, [currentStepIndex, procedures]);

    const onStepClick = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            const index = Number(e.currentTarget.getAttribute("data-index"));
            setCurrentStepIndex(index);
        },
        []
    );

    // 当 `currentStepIndex` 变化时，改写当前 URL
    useEffect(() => {
        const url = new URL(window.location.href);
        if (
            (Number(url.searchParams.get(searchParamIndex)) || 0) !==
            currentStepIndex
        ) {
            if (currentStepIndex === 0)
                url.searchParams.delete(searchParamIndex);
            else url.searchParams.set(searchParamIndex, `${currentStepIndex}`);
            window.history.replaceState(window.history.state, "", url.href);
        }
    }, [currentStepIndex]);

    return (
        <>
            <section className={styles["procedures"]}>
                <h1>{title}</h1>
                <h3>PROCEDURES</h3>
                <section className={styles["list"]}>
                    {procedures.map(({ step }, index) => (
                        <TagButton
                            key={index}
                            data-index={index}
                            onClick={onStepClick}
                            className={classNames([
                                styles["item"],
                                {
                                    [styles["is-active"]]:
                                        index === currentStepIndex,
                                },
                            ])}
                        >
                            {step}
                        </TagButton>
                    ))}
                </section>
            </section>
            <section
                className={classNames([
                    styles["current-procedure"],
                    {
                        [styles[`is-view-${viewType}`]]: true,
                    },
                ])}
            >
                <strong className={styles["title"]}>
                    {currentProcedure.step}
                </strong>
                <div className={styles["body"]}>
                    {currentProcedure.list.map((item, index) => {
                        if (item === "")
                            return (
                                <em className={styles["spacer"]} key={index} />
                            );

                        if (typeof item === "string")
                            return (
                                <span
                                    className={classNames([
                                        styles["subtitle"],
                                        {
                                            [styles["is-empty"]]: item === " ",
                                        },
                                    ])}
                                    key={index}
                                >
                                    {item}
                                </span>
                            );

                        const ident =
                            typeof item[0] === "object" &&
                            "ident" in item[0] &&
                            item[0].ident;
                        const last = item.at(-1);
                        return (
                            <dl
                                className={classNames([
                                    styles["item"],
                                    {
                                        [styles["mod-no-left"]]:
                                            typeof item[0] === "undefined",
                                        [styles[`mod-level-${ident}`]]:
                                            typeof ident === "number",
                                        [styles["mod-no-dots"]]:
                                            typeof ident === "number" &&
                                            Array.isArray(item[1]),
                                    },
                                ])}
                                key={index}
                            >
                                {typeof ident === "number" &&
                                Array.isArray(item[1]) ? (
                                    <dt>
                                        {item[1].map((line, index) => (
                                            <p key={index}>{line}</p>
                                        ))}
                                    </dt>
                                ) : (
                                    <>
                                        <dt>
                                            {item
                                                .slice(
                                                    typeof ident === "number"
                                                        ? 1
                                                        : 0,
                                                    -1
                                                )
                                                .join(" ")}
                                        </dt>
                                        <dd className={styles["action"]}>
                                            {typeof last === "string"
                                                ? last
                                                : Array.isArray(last)
                                                  ? last.map((line, index) => (
                                                        <p key={index}>
                                                            {line}
                                                        </p>
                                                    ))
                                                  : null}
                                        </dd>
                                    </>
                                )}
                            </dl>
                        );
                    })}
                </div>
            </section>
        </>
    );
};

export default Procedures;
