import { memo, useEffect, type FC } from "react";

import hashHistory from "history/hash";
import browserHistory from "history/browser";

// ============================================================================

const PrepareHistory: FC = () => {
    useEffect(() => {
        if (!window._browserHistory) window._browserHistory = browserHistory;
    }, []);

    return null;
};

export default memo(PrepareHistory);
