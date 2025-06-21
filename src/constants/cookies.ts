import { type SerializeOptions } from "cookie";
import dayjs from "dayjs";

// ============================================================================

export const VIDEO_SOURCE = "VIDEO_SOURCE";

// ============================================================================

export const getSetVideoSourceOptions = (options?: SerializeOptions) => ({
    path: "/",
    expires: dayjs(new Date()).add(365, "days").toDate(),
    ...options,
});
