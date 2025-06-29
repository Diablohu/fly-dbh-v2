import { z } from "astro:schema";
import { defineAction, ActionError } from "astro:actions";
import { fetch } from "@/services/sanity";
import { transformImagePath } from "@/utils/sanity-helpers";
import { type VideoItemType } from "@/types";
import actionErrorHandler from "./_error-handler";
import { E30000 } from "@/constants/error-codes";

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
    'aircraft_onboard_devices': aircraft_onboard_devices[]->{
        _id,
        'slug': slug.current,
        'maker': maker->name_zh_cn,
        name,
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
    'game_updates': msfs_updates[]->{
        _id,
        'slug': slug.current,
        'game': platform->name,
        series,
        number,
        release
    },
    'events': events[]->{
        _id,
        'slug': slug.current,
        name,
        start,
        end
    }
}`;
// links

const actions = {
    watchPageFetch: defineAction({
        input: z.string(),
        handler: async (cmsIdOrSlug, context) => {
            try {
                const queryString = `*[_type == "video" && ( _id == "${cmsIdOrSlug}" || slug.current == "${cmsIdOrSlug}")] ${fetchProjections}`;
                const res = (
                    await fetch<VideoItemType>(
                        queryString,
                        (res, queryString) => {
                            if (!res[0]) {
                                const err = new ActionError({
                                    message: E30000,
                                    code: "NOT_FOUND",
                                });
                                err.cause = { GROQ: queryString };
                                throw err;
                            }
                            res[0].cover = transformImagePath(res[0].cover);
                            return res;
                        }
                    )
                )[0];

                if (!res) {
                    const err = new ActionError({
                        message: E30000,
                        code: "NOT_FOUND",
                    });
                    err.cause = { GROQ: queryString };
                    throw err;
                }
                return res;
            } catch (err) {
                actionErrorHandler(err);
            }
        },
    }),
};

export default actions;
