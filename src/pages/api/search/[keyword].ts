import type { APIRoute } from "astro";
import { fetch } from "@/services/sanity";

export const GET: APIRoute = async ({ params, request, callAction }) => {
    if (!params.keyword) {
        return new Response(null, {
            status: 404,
            statusText: "Not found",
        });
    }
    return new Response(
        JSON.stringify(
            await fetch(`{
'videos':
    *[_type == "video" && title match "*${params.keyword}*"]
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

'aircraftFamilies': *[_type == "aircraft_family" && (name match "*${params.keyword}*" || aircrafts[].name match "*${params.keyword}*" || aircrafts[].icao_code match "*${params.keyword}*")]
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
    );
};
