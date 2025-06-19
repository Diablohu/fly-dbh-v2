import { useState, useEffect, useCallback } from "react";
import { useStore } from "@nanostores/react";
import { type ValidVideoSourceType } from "@/types";

import videoSource from "@/stores/video-source";

// ============================================================================

const useVideoSource = (
    /**
     * 已选择的初始值
     * - 通常情况下，该值应为 _Astro_ 模板中服务器渲染时获取的 Cookie 值
     *     - 参见 `@/layouts/layout.astro` 向 _React_ 组件 `<BannerAndHeader />` 传入 _props_ 的方式
     */
    selected: ValidVideoSourceType
): [ValidVideoSourceType, typeof videoSource.set] => {
    const $videoSource = useStore(videoSource);
    const [currentValue, setCurrentValue] =
        useState<ValidVideoSourceType>(selected);

    const setStoreValue = useCallback((newValue: ValidVideoSourceType) => {
        videoSource.set(newValue);
    }, []);

    useEffect(() => {
        setCurrentValue($videoSource);
    }, [$videoSource]);

    return [currentValue, setStoreValue];
};

export default useVideoSource;
