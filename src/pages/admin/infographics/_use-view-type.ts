import { useState, useEffect, useCallback } from "react";
import { atom } from "nanostores";
import { useStore } from "@nanostores/react";

import { type ViewTypeValue } from "./_types";

// ============================================================================

const currentViewType = atom<ViewTypeValue>("default");

// ============================================================================

const useViewType = (): [ViewTypeValue, typeof currentViewType.set] => {
    const $currentViewType = useStore(currentViewType);
    const [currentValue, setCurrentValue] = useState<ViewTypeValue>("default");

    const setStoreValue = useCallback((newValue: ViewTypeValue) => {
        currentViewType.set(newValue);
    }, []);

    useEffect(() => {
        setCurrentValue($currentViewType);
    }, [$currentViewType]);

    return [currentValue, setStoreValue];
};

export default useViewType;
