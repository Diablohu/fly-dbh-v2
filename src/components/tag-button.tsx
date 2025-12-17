import { type FC, type HTMLAttributes } from "react";
import classNames from "classnames";

import styles from "./tag-button.module.less";

// ============================================================================

type Props = {
    href?: string;
    prefix?: string;
};

// ============================================================================

const TagButton: FC<
    Props &
        HTMLAttributes<HTMLAnchorElement | HTMLButtonElement> & {
            target?: string;
        }
> = ({ className, href, prefix, children, ...props }) => {
    const Element = href ? "a" : "button";
    return (
        <Element
            className={classNames([styles["tag"], className])}
            href={Element === "a" ? href : undefined}
            type={Element === "button" ? "button" : undefined}
            {...props}
        >
            {prefix && <span className={styles["prefix"]}>{prefix}</span>}
            {children}
        </Element>
    );
};

export default TagButton;
