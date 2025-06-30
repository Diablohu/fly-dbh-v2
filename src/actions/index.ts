import homePageActions from "./home-page";
import watchPageActions from "./watch-page";
import videoListPageActions from "./video-list-page";
import rssFeedActions from "./rss-feed";

export const server = {
    ...homePageActions,
    ...watchPageActions,
    ...videoListPageActions,
    ...rssFeedActions,
};
