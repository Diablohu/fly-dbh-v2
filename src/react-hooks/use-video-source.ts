import { useState, useEffect, useCallback } from "react";
import { atom } from "nanostores";
import { useStore } from "@nanostores/react";
import { parse as parseCookie, serialize as serializeCookie } from "cookie";

import {
    VIDEO_SOURCE,
    getGeneralOptions as getGeneralCookieOptions,
} from "@/constants/cookies";
import { type ValidVideoSourceType } from "@/types";
import { defaultVideoSource } from "@/global";

// ============================================================================

const videoSource = atom<ValidVideoSourceType>(
    globalThis.window
        ? (parseCookie(document.cookie)[
              VIDEO_SOURCE
          ] as unknown as ValidVideoSourceType) || defaultVideoSource
        : defaultVideoSource
);

if (globalThis.window) {
    // 客户端中
    // 监听 `videoSource` 变化，将最新值写入 cookie
    videoSource.subscribe((newValue, oldValue) => {
        document.cookie = serializeCookie(
            VIDEO_SOURCE,
            newValue,
            getGeneralCookieOptions()
        );
    });
}

// ============================================================================

const useVideoSource = (
    /**
     * 已选择的初始值
     * - 通常情况下，该值应为 _Astro_ 模板中服务器渲染时获取的 Cookie 值
     *     - 参见 `@/layouts/layout.astro` 向 _React_ 组件 `<BannerAndHeader />` 传入 _props_ 的方式
     * 
     * 为什么需要传入初始值
     *  - 为确保 _Astro_ 渲染结果和 _React_ 脱水结果一致
     */
    selected: ValidVideoSourceType
): [ValidVideoSourceType, typeof videoSource.set] => {
    /**
     * 为什么要使用 Nanostore
     *  - 方便同一页中可以有多个 UI 实例，保证同时更新
     */
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
