import type { APIRoute } from "astro";
import { actions } from "astro:actions";
import rss from "@astrojs/rss";

import {
    title,
    slogan,
    getVideoPageLink,
    getChallengePageLink,
    aircraftTypeString,
} from "@/global";

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
                await context.callAction(actions.rssFeed.fetch, undefined)
            ).data?.map((post) => {
                // console.log(post);
                if (Array.isArray(post.tags))
                    return {
                        title: "【视频】" + post.title,
                        link: getVideoPageLink(post.slug || post._id),
                        pubDate: new Date(post.release),
                        description: cdata(post.description),
                        categories: post.tags.map((tag) => cdata(tag.name)),
                    };
                if (Array.isArray(post.typical_aircraft_types))
                    return {
                        title:
                            "【固定翼挑战】" +
                            [
                                ...new Set([
                                    post.aerodrome?.icao,
                                    post.aerodrome?.iata,
                                    post.aerodrome?.faa,
                                    post.aerodrome?.designator,
                                ]),
                            ]
                                .filter(Boolean)
                                .join("/") +
                            " " +
                            (post.aerodrome.is_closed ? "（旧）" : "") +
                            post.aerodrome.name +
                            "：" +
                            post.name,
                        link: getChallengePageLink(post.slug || post._id),
                        pubDate: new Date(post._createdAt),
                        categories: post.typical_aircraft_types.map((t) =>
                            cdata(aircraftTypeString[t]),
                        ),
                    };
                return {};
            }) ?? [],
        // (optional) inject custom xml
        customData: `<language>zh-cn</language>`,
    });
};
