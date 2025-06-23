import { memo, useEffect, type FC } from "react";

import hashHistory from "history/hash";
import browserHistory from "history/browser";

import useWindow from "@/react-hooks/use-window";

// ============================================================================

/**
 * `仅客户端环境`
 * - 为 `window` 挂载 `hashHistory` 和 `browserHistory`
 * - 监听 `window` 更改尺寸，实时更新滚动条宽度 CSS 变量 `--body-scrollbar-width`
 */
const PrepareHistory: FC = () => {
    useWindow(
        (force?: boolean) => {
            document.documentElement.style.setProperty(
                "--body-scrollbar-width",
                // window.innerWidth - document.documentElement.clientWidth + "px"
                // 获取 body 实际宽度，这个数值不包含 body 的 margin
                window.innerWidth - document.body.offsetWidth + "px"
            );
        },
        {
            resize: true,
        }
    );

    useEffect(() => {
        if (!window._browserHistory) window._browserHistory = browserHistory;
        if (!window._hashHistory) window._hashHistory = hashHistory;
        window._contentRoot = document.querySelector(
            "body > .root"
        ) as HTMLDivElement;
    }, []);

    return null;
};

export default memo(PrepareHistory);
