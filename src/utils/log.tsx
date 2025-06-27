import dbg from "debug";

// ============================================================================

const names = {
    FLY_DBH_V2: "FLY-DBH.com V2",
    ERROR: "Error",
    COOKIES: "Cookies",
    VIDEO_LIST_GRID: "Video List Grid",
    VIDEO_LIST_PAGE_CATEGORIES: "Video List Page: Categories",
};

// ============================================================================

const debug = dbg(names.FLY_DBH_V2);
// debug.color = "#FE8DE6";
debug.namespace = names.FLY_DBH_V2;

export default debug;

// ============================================================================

export const errorLog = dbg(names.ERROR);
errorLog.namespace = names.ERROR;

export const cookie = dbg(names.COOKIES);
cookie.namespace = names.COOKIES;

export const videoListGrid = dbg(names.VIDEO_LIST_GRID);
videoListGrid.namespace = names.VIDEO_LIST_GRID;

export const videoListPageCategories = dbg(names.VIDEO_LIST_PAGE_CATEGORIES);
videoListPageCategories.namespace = names.VIDEO_LIST_PAGE_CATEGORIES;

// ============================================================================

if (import.meta.env.DEV || import.meta.env.MODE === "test") {
    debug.enabled = true;
    cookie.enabled = true;
    videoListGrid.enabled = true;
    videoListPageCategories.enabled = true;
}

errorLog.enabled = true;
