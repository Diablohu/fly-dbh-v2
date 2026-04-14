import admin from "./admin";
import homePage from "./home-page";
import rssFeed from "./rss-feed";
import sitemap from "./sitemap";
import search from "./search";
import videoListPage from "./video-list-page";
import watchPage from "./watch-page";
import challenge from "./challenge";

export const server = {
    admin,

    search,
    challenge,

    homePage,
    videoListPage,
    watchPage,

    sitemap,
    rssFeed,
};
