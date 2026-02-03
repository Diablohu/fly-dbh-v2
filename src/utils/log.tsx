import dbg from "debug";

// ============================================================================

const names = {
    FLY_DBH_V2: "FLY-DBH.com V2",
    ERROR: "Error",
    COOKIES: "Cookies",
    SEARCH: "Search",
    LIST_GRID: "List Grid",
    VIDEO_LIST_PAGE_CATEGORIES: "Video List Page: Categories",
    CHALLENGE: "Challenge",
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

export const search = dbg(names.SEARCH);
search.namespace = names.SEARCH;

export const listGrid = dbg(names.LIST_GRID);
listGrid.namespace = names.LIST_GRID;

export const videoListPageCategories = dbg(names.VIDEO_LIST_PAGE_CATEGORIES);
videoListPageCategories.namespace = names.VIDEO_LIST_PAGE_CATEGORIES;

export const challenge = dbg(names.CHALLENGE);
challenge.namespace = names.CHALLENGE;

// ============================================================================

if (import.meta.env.DEV || import.meta.env.MODE === "test") {
    debug.enabled = true;
    cookie.enabled = true;
    search.enabled = true;
    listGrid.enabled = true;
    videoListPageCategories.enabled = true;
    challenge.enabled = true;
}

errorLog.enabled = true;
