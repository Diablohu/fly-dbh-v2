import {
    memo,
    useCallback,
    useState,
    // useEffect,
    type FC,
    type HTMLAttributes,
} from "react";
import classNames from "classnames";

import symbolCopy from "@/assets/svg-symbols/copy.svg?raw";
import symbolCheckmark from "@/assets/svg-symbols/checkmark.svg?raw";

// import toast from "@/utils/toast";
import styles from "./copy-button.module.less";

const CopyButton: FC<
    {
        className?: string;
        copyText: string;
    } & HTMLAttributes<HTMLButtonElement>
> & {
    timeoutResetState?: NodeJS.Timeout;
} = ({ className, copyText, children, ...props }) => {
    const [state, setState] = useState<"ready" | "success">("ready");

    const onClick = useCallback(() => {
        if (CopyButton.timeoutResetState)
            clearTimeout(CopyButton.timeoutResetState);
        navigator.clipboard.writeText(copyText).then(() => {
            setState("success");
            CopyButton.timeoutResetState = setTimeout(() => {
                setState("ready");
            }, 1500);
        });
    }, [copyText]);

    // useEffect(() => {
    //     switch (state) {
    //         case "ready": {
    //             break;
    //         }
    //         case "success": {
    //             CopyButton.timeoutResetState = setTimeout(() => {
    //                 setState("ready");
    //             }, 2000);
    //             break;
    //         }
    //     }
    // }, [state]);

    return (
        <button
            className={classNames([
                styles["copy-button"],
                styles[`is-state-${state}`],
                className,
            ])}
            onClick={onClick}
            type="button"
            title="复制到剪贴板"
            aria-label="复制到剪贴板"
            {...props}
        >
            <span
                className={styles["icon"]}
                dangerouslySetInnerHTML={{
                    __html: symbolCopy,
                }}
            />
            {children}
            <span
                className={styles["toast-success"]}
                dangerouslySetInnerHTML={{
                    __html: symbolCheckmark,
                }}
            />
            {state === "success" ? "" : ""}
        </button>
    );
};

export default memo(CopyButton);
