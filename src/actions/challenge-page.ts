import { defineAction, ActionError } from "astro:actions";
import { fetch } from "@/services/sanity";
import actionErrorHandler from "./_error-handler";
import { E60000 } from "@/constants/error-codes";
import { type ChallengeListItemType } from "@/types";

const actions = {
    fetchList: defineAction({
        handler: async () => {
            try {
                const queryString = `*[_type == "approach_challenge"] {
  _id,
  'slug': slug.current,
  'aerodrome': aerodrome->{
    _id,
    'slug': slug.current,
    name,
    icao,
    iata,
    location,
  },
  name,
  difficulty,
  max_allowed_aircraft_category
} | order( max_allowed_aircraft_category asc, aerodrome.icao asc )`;
                const res = await fetch<ChallengeListItemType>(queryString, {
                    transform: (res, queryString) => {
                        if (!res[0]) {
                            const err = new ActionError({
                                message: E60000,
                                code: "NOT_FOUND",
                            });
                            err.cause = { GROQ: queryString };
                            throw err;
                        }
                        // res[0].cover = transformImagePath(res[0].cover);
                        return res;
                    },
                });

                if (!res) {
                    const err = new ActionError({
                        message: E60000,
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
