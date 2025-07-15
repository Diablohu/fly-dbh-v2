import { type SerializeOptions } from "cookie";
import dayjs from "dayjs";

// ============================================================================

export const VIDEO_SOURCE = "VIDEO_SOURCE";
export const FORCE_COLOR_SCHEME = "FORCE_COLOR_SCHEME";
export const CONTENT_LIST_AUTO_LOAD_MORE = "CONTENT_LIST_AUTO_LOAD_MORE";
export const VIDEO_ITEM_SHOW_PLATFORM_LINKS_ON_HOVER =
    "VIDEO_ITEM_SHOW_PLATFORM_LINKS_ON_HOVER";
export const ADMIN_LAST_LOGIN = "ADMIN_LAST_LOGIN";

// ============================================================================

export const getGeneralOptions = (options?: SerializeOptions) => ({
    path: "/",
    expires: dayjs(new Date()).add(365, "days").toDate(),
    ...options,
});
