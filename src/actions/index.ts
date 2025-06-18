import homePageActions from "./home-page";
import watchPageActions from "./watch-page";

export const server = {
    ...homePageActions,
    ...watchPageActions,
};
