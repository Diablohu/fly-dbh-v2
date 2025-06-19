import { memo, useEffect, type FC } from "react";

import hashHistory from "history/hash";
import browserHistory from "history/browser";

// ============================================================================

/**
 * `仅客户端环境`
 *
 * 为 `window` 挂载 `hashHistory` 和 `browserHistory`
 */
const PrepareHistory: FC = () => {
    useEffect(() => {
        if (!window._browserHistory) window._browserHistory = browserHistory;
        if (!window._hashHistory) window._hashHistory = hashHistory;
    }, []);

    return null;
};

export default memo(PrepareHistory);
