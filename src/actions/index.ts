import homePageActions from "./home-page";
import watchPageActions from "./watch-page";
import videoListPageFetch from "./video-list-page";

export const server = {
    ...homePageActions,
    ...watchPageActions,
    ...videoListPageFetch,
};
