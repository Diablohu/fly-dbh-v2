import type { APIRoute } from "astro";
import { actions } from "astro:actions";
import dayjs from "dayjs";
import { getVideoPageLink } from "@/global";

/*
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
<url>
<loc>https://fly-dbh.com</loc>
</url>
<url>
<loc>https://fly-dbh.com/challenges</loc>
</url>
<url>
<loc>https://fly-dbh.com/videos</loc>
</url>
</urlset>
*/

export const GET: APIRoute = async ({ site, callAction }) => {
    return new Response(`\
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${(await callAction(actions.sitemap.fetchVideos, undefined)).data
    ?.map(
        (item) => `\
    <url>
        <loc>${site}${getVideoPageLink(item.slug || item._id).slice(1)}</loc>
        <lastmod>${dayjs(item._updatedAt).format("YYYY-MM-DD")}</lastmod>
    </url>`
    )
    .join("\n")}
</urlset>`);
};
