import type { APIRoute } from "astro";
import { fetch } from "@/services/sanity";
import { stringReplaceImagePath } from "@/utils/sanity-helpers";

export const GET: APIRoute = async ({ params }) => {
    if (!params.keyword) {
        return new Response(null, {
            status: 404,
            statusText: "Not found",
        });
    }

    const keywords = [
        ...new Set([
            params.keyword,
            params.keyword.replace(/([a-z])([0-9])/gi, "$1-$2"),
            params.keyword.replace(/^[a-z]{1}([0-9a-z]{3})/gi, "$1"),
        ]),
    ];
    const s = (name: string) =>
        `(${keywords.map((keyword) => `${name} match "*${keyword}*"`).join(" || ")})`;

    return new Response(
        stringReplaceImagePath(
            JSON.stringify(
                await fetch(`{
'videos':
    *[_type == "video" && ${s("title")}]
    | order( release desc )
    {
        _id,
        title,
        'tags': tags[]->{
            "value": name,
            "label": title
        },
        release,
        description,
        links,
        "cover": cover.asset->path + '?auto=format&w=400&q=65',
    }
    [0...10],

'categories': *[_type == "tag" && title match "*${params.keyword}*"]
    | order( sort asc )
    {
        _id,
        title,
        tag_type,
    }
    [0...5],

'aircraftFamilies': *[_type == "aircraft_family" && (${s("name")} || ${s("aircrafts[].name")} || aircrafts[].icao_code match "*${params.keyword}*")]
    | order( maker->icao_code asc, name asc )
    {
        _id,
        name,
        'maker': maker->{
            icao_code,
            name,
            name_zh_cn,
        },
        aircrafts[]{icao_code, name},
    }
    [0...5],
}`)
            )
        )
    );
};
