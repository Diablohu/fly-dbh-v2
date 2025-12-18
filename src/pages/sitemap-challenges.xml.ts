import type { APIRoute } from "astro";
import { actions } from "astro:actions";
import dayjs from "dayjs";
import minMax from "dayjs/plugin/minMax";
import getChallengePageLink from "@/utils/get-challenge-page-link";
import { generateResponse } from "@/services/sitemap";

dayjs.extend(minMax);

export const GET: APIRoute = async ({ site, callAction }) => {
    return generateResponse(
        (
            await callAction(actions.sitemap.fetchChallenges, undefined)
        ).data?.map((item) => ({
            loc: `${site}${getChallengePageLink(item.slug || item._id).slice(1)}`,
            lastmod: `${dayjs
                .max(dayjs(item._updatedAt), dayjs(item.aerodrome._updatedAt))
                .format("YYYY-MM-DD")}`,
        })) || []
    );
};
