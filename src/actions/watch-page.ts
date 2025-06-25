import { z } from "astro:schema";
import { defineAction, ActionError } from "astro:actions";
import { fetch } from "@/services/sanity";
import { transformImagePath } from "@/utils/sanity-helpers";
import { type VideoItemType } from "@/types";
import actionErrorHandler from "./_error-handler";

const fetchProjections = `{
    _id,
    'slug': slug.current,
    title,
    'tags': tags[]->{
        _id,
        'slug': slug.current,
        "name": title
    },
    release,
    "cover": cover.asset->path,
    description,
    links,
    'aircraft_families': aircraft_families[]->{
        _id,
        'slug': slug.current,
        name,
        'maker': maker->name_zh_cn
    },
    'aerodromes': aerodromes[]->{
        _id,
        'slug': slug.current,
        name,
        icao,
        iata
    },
    'developers': developers[]->{
        _id,
        'slug': slug.current,
        name
    },
    'games': games[]->{
        _id,
        'slug': slug.current,
        name
    },
    'msfs_updates': msfs_updates[]->{
        _id,
        'slug': slug.current,
        game,
        series,
        number,
        release
    }
}`;
// links

const actions = {
    watchPageFetch: defineAction({
        input: z.string(),
        handler: async (cmsIdOrSlug) => {
            try {
                const res = (
                    await fetch<VideoItemType>(
                        `*[_type == "video" && ( _id == "${cmsIdOrSlug}" || slug.current == "${cmsIdOrSlug}")] ${fetchProjections}`,
                        (res) => {
                            res[0].cover = transformImagePath(res[0].cover);
                            return res;
                        }
                    )
                )[0];

                if (!res) throw new Error("Video not found");
                return res;
            } catch (err) {
                actionErrorHandler(err);
            }
        },
    }),
};

export default actions;
