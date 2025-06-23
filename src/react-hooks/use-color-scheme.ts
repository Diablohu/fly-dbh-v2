import { useState, useEffect, useCallback } from "react";
import { atom } from "nanostores";
import { useStore } from "@nanostores/react";
import { parse as parseCookie, serialize as serializeCookie } from "cookie";

import {
    FORCE_COLOR_SCHEME,
    getGeneralOptions as getGeneralCookieOptions,
} from "@/constants/cookies";
import { type ValidColorSchemeType } from "@/types";
import { cookie as logCookie } from "@/utils/log";

// ============================================================================

const forcedColorScheme = atom<ValidColorSchemeType | undefined>(
    globalThis.window
        ? (parseCookie(document.cookie)[
              FORCE_COLOR_SCHEME
          ] as unknown as ValidColorSchemeType) || undefined
        : undefined
);

if (globalThis.window) {
    // 客户端中
    // 监听 `forcedColorScheme` 变化，将最新值写入 cookie，并更改 HTML
    forcedColorScheme.listen((newValue, oldValue) => {
        document.documentElement.classList.remove("force-color-scheme-dark");
        document.documentElement.classList.remove("force-color-scheme-light");

        if (!newValue) {
            document.cookie = serializeCookie(FORCE_COLOR_SCHEME, "", {
                ...getGeneralCookieOptions(),
                expires: new Date(),
            });
            logCookie("removed FORCE_COLOR_SCHEME");
        } else {
            document.cookie = serializeCookie(
                FORCE_COLOR_SCHEME,
                newValue,
                getGeneralCookieOptions()
            );
            document.documentElement.classList.add(
                `force-color-scheme-${newValue}`
            );
            logCookie(`set FORCE_COLOR_SCHEME to ${newValue}`);
        }
    });
}

// ============================================================================

const useColorScheme = (
    /**
     * 已选择的初始值
     * - 通常情况下，该值应为 _Astro_ 模板中服务器渲染时获取的 Cookie 值
     *     - 参见 `@/layouts/layout.astro` 向 _React_ 组件 `<BannerAndHeader />` 传入 _props_ 的方式
     *
     * 为什么需要传入初始值
     *  - 为确保 _Astro_ 渲染结果和 _React_ 脱水结果一致
     */
    selected?: ValidColorSchemeType
): [ValidColorSchemeType | undefined, typeof forcedColorScheme.set] => {
    /**
     * 为什么要使用 Nanostore
     *  - 方便同一页中可以有多个 UI 实例，保证同时更新
     */
    const $forcedColorScheme = useStore(forcedColorScheme);
    const [currentValue, setCurrentValue] = useState<
        ValidColorSchemeType | undefined
    >(selected);

    const setStoreValue = useCallback((newValue: ValidColorSchemeType) => {
        forcedColorScheme.set(newValue);
    }, []);

    useEffect(() => {
        setCurrentValue($forcedColorScheme);
    }, [$forcedColorScheme]);

    return [currentValue, setStoreValue];
};

export default useColorScheme;
