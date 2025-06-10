import dbg from "debug";
import { common } from "@/constants/debug-keys";

const debug = dbg(common);
debug.color = "#FE8DE6";
debug.namespace = "FLY-DBH";

if (import.meta.env.DEV || import.meta.env.MODE === "test") {
    debug.enabled = true;
}

export default debug;
