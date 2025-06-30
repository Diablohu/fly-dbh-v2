import type { APIRoute } from "astro";
import { actions } from "astro:actions";
import rss from "@astrojs/rss";

import { title, slogan } from "@/global";

const cdata = (str: string) => `<![CDATA[${str}]]>`;

export const GET: APIRoute = async (context) => {
    return rss({
        // `<title>` field in output xml
        title,
        // `<description>` field in output xml
        description: slogan,
        // Pull in your project "site" from the endpoint context
        // https://docs.astro.build/en/reference/api-reference/#site
        site: context.site || "",
        trailingSlash: false,
        // Array of `<item>`s in output xml
        // See "Generating items" section for examples using content collections and glob imports
        items:
            (
                await context.callAction(actions.rssFeedFetch, undefined)
            ).data?.map((post) => {
                return {
                    title: post.title,
                    link: `/watch/${post.slug || post._id}`,
                    pubDate: new Date(post.release),
                    description: cdata(post.description),
                    categories: post.tags.map((tag) => cdata(tag.name)),
                };
            }) ?? [],
        // (optional) inject custom xml
        customData: `<language>zh-cn</language>`,
    });
};
