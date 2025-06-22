import { type SerializeOptions } from "cookie";
import dayjs from "dayjs";

// ============================================================================

export const VIDEO_SOURCE = "VIDEO_SOURCE";
export const FORCE_COLOR_SCHEME = "FORCE_COLOR_SCHEME";
export const VIDEO_LIST_AUTO_LOAD_MORE = "VIDEO_LIST_AUTO_LOAD_MORE";

// ============================================================================

export const getGeneralOptions = (options?: SerializeOptions) => ({
    path: "/",
    expires: dayjs(new Date()).add(365, "days").toDate(),
    ...options,
});
