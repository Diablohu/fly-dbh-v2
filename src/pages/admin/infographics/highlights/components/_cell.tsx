import {
    type DetailedHTMLProps,
    type HTMLAttributes,
    // type CSSProperties,
    type ReactNode,
    type FC,
} from "react";
import classNames from "classnames";

import useViewType from "../../_use-view-type";

import styles from "./_cell.module.less";

// ============================================================================

export type CellProps = {
    /** 标题 */
    title: ReactNode;
    /** 内容 */
    infos?: Array<
        | ReactNode
        | {
              type: "fix" | "new" | "implement" | "change" | "remove";
              content: ReactNode;
          }
    >;
    /** 配图 */
    img?: string;
    mask?: boolean;
    textSize?: "lg" | "md" | "sm";
    bgMaskOrientation?: "horizontal" | "vertical";
    align?: "left" | "center" | "right";
    verticalAlign?: "top" | "middle" | "bottom";
    // style?: CSSProperties & Record<string, string>;
    extra?: ReactNode;
} & Partial<
    Omit<
        DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
        "title"
    >
>;

// Functional Component =======================================================

const Cell: FC<CellProps> = ({
    className,

    title,
    infos,
    img,

    textSize,
    bgMaskOrientation = "vertical",
    align = "left",
    verticalAlign = "top",
    extra,

    children,
    style = {},

    ...props
}) => {
    const [viewType] = useViewType();
    return (
        <div
            className={classNames([
                className,
                styles["cell"],
                {
                    [styles[`is-view-${viewType}`]]: true,

                    [styles[`mod-text-size-${textSize}`]]: !!textSize,
                    [styles[`mod-bg-mask-orientation-${bgMaskOrientation}`]]:
                        !!bgMaskOrientation,
                    [styles[`mod-align-${align}`]]: !!align,
                    [styles[`mod-vertical-align-${verticalAlign}`]]:
                        !!verticalAlign,
                },
            ])}
            style={{
                backgroundImage: !img ? undefined : `url(${img})`,
                ...style,
            }}
            {...props}
        >
            {children ?? (
                <>
                    <strong>{title}</strong>
                    {infos?.map((info, index) => {
                        if (
                            info &&
                            typeof info === "object" &&
                            "content" in info
                        ) {
                            return (
                                <span key={index}>
                                    <CellTag type={info.type}></CellTag>
                                    {info.content}
                                </span>
                            );
                        }
                        return <span key={index}>{info}</span>;
                    })}
                </>
            )}
            {extra}
        </div>
    );
};

export default Cell;

// ============================================================================

export const CellTag: FC<
    {
        type: Exclude<Required<CellProps>["infos"][0], ReactNode>["type"];
    } & DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>
> = ({ className, type = "new", children, ...props }) => {
    return (
        <small
            className={classNames([
                className,
                styles[`cell-tag`],
                `is-type-${type}`,
                {
                    [styles[`is-type-${type}`]]: !!type,
                },
            ])}
            {...props}
        >
            {children ??
                (type === "fix"
                    ? "修正"
                    : type === "new"
                      ? "新"
                      : type === "implement"
                        ? "实装"
                        : type === "change"
                          ? "变更"
                          : type === "remove"
                            ? "移除"
                            : type)}
        </small>
    );
};
