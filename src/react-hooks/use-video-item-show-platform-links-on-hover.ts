import { useState, useEffect, useCallback } from "react";
import { atom } from "nanostores";
import { useStore } from "@nanostores/react";
import { parse as parseCookie, serialize as serializeCookie } from "cookie";

import {
    VIDEO_ITEM_SHOW_PLATFORM_LINKS_ON_HOVER,
    getGeneralOptions as getGeneralCookieOptions,
} from "@/constants/cookies";
import { type ValidVideoItemShowPlatformLinksOnHoverType } from "@/types";
import { cookie as logCookie } from "@/utils/log";

// ============================================================================

const videoItemShowPlatformLinksOnHover = atom<
    ValidVideoItemShowPlatformLinksOnHoverType | undefined
>(
    globalThis.window
        ? (parseCookie(document.cookie)[
              VIDEO_ITEM_SHOW_PLATFORM_LINKS_ON_HOVER
          ] as unknown as ValidVideoItemShowPlatformLinksOnHoverType) || "0"
        : "0",
);

if (globalThis.window) {
    // 客户端中
    // 监听 `contentListAutoLoadMore` 变化，将最新值写入 cookie
    videoItemShowPlatformLinksOnHover.listen((newValue /*, oldValue*/) => {
        const v = !newValue ? "0" : newValue;
        document.cookie = serializeCookie(
            VIDEO_ITEM_SHOW_PLATFORM_LINKS_ON_HOVER,
            v,
            getGeneralCookieOptions(),
        );
        logCookie(`set VIDEO_ITEM_SHOW_PLATFORM_LINKS_ON_HOVER to ${v}`);
    });
}

// ============================================================================

const useVideoItemShowPlatformLinksOnHover = (
    /**
     * 已选择的初始值
     * - 通常情况下，该值应为 _Astro_ 模板中服务器渲染时获取的 Cookie 值
     *     - 参见 `@/layouts/layout.astro` 向 _React_ 组件 `<BannerAndHeader />` 传入 _props_ 的方式
     *
     * 为什么需要传入初始值
     *  - 为确保 _Astro_ 渲染结果和 _React_ 脱水结果一致
     */
    selected: ValidVideoItemShowPlatformLinksOnHoverType,
): [
    ValidVideoItemShowPlatformLinksOnHoverType | undefined,
    typeof videoItemShowPlatformLinksOnHover.set,
] => {
    /**
     * 为什么要使用 Nanostore
     *  - 方便同一页中可以有多个 UI 实例，保证同时更新
     */
    const $videoItemShowPlatformLinksOnHover = useStore(
        videoItemShowPlatformLinksOnHover,
    );
    const [currentValue, setCurrentValue] = useState<
        ValidVideoItemShowPlatformLinksOnHoverType | undefined
    >(selected);

    const setStoreValue = useCallback(
        (newValue: ValidVideoItemShowPlatformLinksOnHoverType) => {
            videoItemShowPlatformLinksOnHover.set(newValue);
        },
        [],
    );

    useEffect(() => {
        setCurrentValue($videoItemShowPlatformLinksOnHover);
    }, [$videoItemShowPlatformLinksOnHover]);

    return [currentValue, setStoreValue];
};

export default useVideoItemShowPlatformLinksOnHover;
