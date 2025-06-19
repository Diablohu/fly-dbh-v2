import { atom } from "nanostores";
import Cookies from "js-cookie";
import { VIDEO_SOURCE } from "@/constants/cookie-names";
import { type ValidVideoSourceType } from "@/types";
import { defaultVideoSource } from "@/global";

const videoSource = atom<ValidVideoSourceType>(
    globalThis.window
        ? (Cookies.get(VIDEO_SOURCE) as unknown as ValidVideoSourceType) ||
              defaultVideoSource
        : defaultVideoSource
);

// videoSource.

export default videoSource;

// ============================================================================

if (globalThis.window) {
    // 客户端中

    // 监听 `videoSource` 变化，将最新值写入 cookie
    videoSource.subscribe((newValue, oldValue) => {
        Cookies.set(VIDEO_SOURCE, newValue);
    });
}
