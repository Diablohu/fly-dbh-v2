import dbg from "debug";
import { FLY_DBH_V2 } from "@/constants/debug-keys";

const debug = dbg(FLY_DBH_V2);
debug.color = "#FE8DE6";
debug.namespace = "FLY-DBH";

if (import.meta.env.DEV || import.meta.env.MODE === "test") {
    debug.enabled = true;
}

export default debug;
