import type { APIRoute } from "astro";
import { actions } from "astro:actions";
import dayjs from "@/utils/dayjs";
import { routeBase, getVideoPageLink, getVideoListPageLink } from "@/global";
import { generateResponse } from "@/services/sitemap";

export const GET: APIRoute = async ({ site, callAction }) => {
    return generateResponse([
        {
            loc: site + routeBase.videoList.slice(1),
        },

        ...((
            await callAction(actions.sitemap.fetchVideoCategories, undefined)
        ).data?.map((item) => ({
            loc:
                site +
                getVideoListPageLink("tag", item.slug || item._id).slice(1),
        })) || []),

        ...((
            await callAction(actions.sitemap.fetchVideos, undefined)
        ).data?.map((item) => ({
            loc: site + getVideoPageLink(item.slug || item._id).slice(1),
            lastmod: dayjs(item._updatedAt).format("YYYY-MM-DD"),
        })) || []),
    ]);
};
