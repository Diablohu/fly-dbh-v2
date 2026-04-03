import {
    type FC,
    type AnchorHTMLAttributes,
    type ButtonHTMLAttributes,
} from "react";
import classNames from "classnames";

import styles from "./tag-button.module.less";

// ============================================================================

type Props = {
    href?: string;
    prefix?: string;
    target?: string;
};

// ============================================================================

const TagButton: FC<
    Props &
        AnchorHTMLAttributes<HTMLAnchorElement> &
        ButtonHTMLAttributes<HTMLButtonElement>
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
