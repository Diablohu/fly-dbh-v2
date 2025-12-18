import type { APIRoute } from "astro";
import { actions } from "astro:actions";
import dayjs from "dayjs";
import minMax from "dayjs/plugin/minMax";
import getChallengePageLink from "@/utils/get-challenge-page-link";

dayjs.extend(minMax);

export const GET: APIRoute = async ({ site, callAction }) => {
    return new Response(`\
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${(await callAction(actions.sitemap.fetchChallenges, undefined)).data
    ?.map(
        (item) => `\
    <url>
        <loc>${site}${getChallengePageLink(item.slug || item._id).slice(1)}</loc>
        <lastmod>${dayjs
            .max(dayjs(item._updatedAt), dayjs(item.aerodrome._updatedAt))
            .format("YYYY-MM-DD")}</lastmod>
    </url>`
    )
    .join("\n")}
</urlset>`);
};
