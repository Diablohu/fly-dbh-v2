import dbg from "debug";
import { FLY_DBH_V2, COOKIE } from "@/constants/debug-keys";

// ============================================================================

const debug = dbg(FLY_DBH_V2);
// debug.color = "#FE8DE6";
debug.namespace = "FLY-DBH";

export default debug;

// ============================================================================

export const cookie = dbg(COOKIE);
cookie.namespace = "Cookies";

// ============================================================================

if (import.meta.env.DEV || import.meta.env.MODE === "test") {
    debug.enabled = true;
    cookie.enabled = true;
}
