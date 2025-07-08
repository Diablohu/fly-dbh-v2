import adminActions from "./admin";
import homePageActions from "./home-page";
import watchPageActions from "./watch-page";
import videoListPageActions from "./video-list-page";
import rssFeedActions from "./rss-feed";

export const server = {
    ...adminActions,
    ...homePageActions,
    ...watchPageActions,
    ...videoListPageActions,
    ...rssFeedActions,
};
