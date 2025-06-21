import { atom } from "nanostores";
import { parse as parseCookie, serialize as serializeCookie } from "cookie";
import { VIDEO_SOURCE, getSetVideoSourceOptions } from "@/constants/cookies";
import { type ValidVideoSourceType } from "@/types";
import { defaultVideoSource } from "@/global";

/**
 * **请勿** 单独使用该 store
 *  - 如需监听或更改视频源，请使用 _React Hook_ `useVideoSource`
 */
const videoSource = atom<ValidVideoSourceType>(
    globalThis.window
        ? (parseCookie(document.cookie)[
              VIDEO_SOURCE
          ] as unknown as ValidVideoSourceType) || defaultVideoSource
        : // 服务器渲染时的初始值也是读取的 Cookie
          defaultVideoSource
);

// videoSource.

export default videoSource;

// ============================================================================

if (globalThis.window) {
    // 客户端中

    // 监听 `videoSource` 变化，将最新值写入 cookie
    videoSource.subscribe((newValue, oldValue) => {
        document.cookie = serializeCookie(
            VIDEO_SOURCE,
            newValue,
            getSetVideoSourceOptions()
        );
    });
}
