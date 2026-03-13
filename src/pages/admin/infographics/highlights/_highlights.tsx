import { type FC } from "react";
import classNames from "classnames";

import useViewType from "../_use-view-type";

import styles from "./_highlights.module.less";

// ============================================================================

/**
 * 如果第 2 个元素是数组，表示没有连接线的多行文本
 */
export type HighlightItemType =
    | string
    | [string, string]
    | [string, string, string]
    | [undefined, string[]]
    | [{ ident: number }, string]
    | [{ ident: number }, string[]]
    | [{ ident: number }, string, string]
    | [{ ident: number }, string, string, string];

// ============================================================================

const Highlights: FC<{
    width?: "narrow" | "wide";
    height?: "short" | "tall";
    title: "msfs2020" | "msfs2024";
    simUpdate?: number;
    isBeta?: boolean;
}> = ({ width, height, title, simUpdate, isBeta = false }) => {
    const [viewType] = useViewType();

    return <section className={styles["highlights"]}></section>;
};

export default Highlights;
