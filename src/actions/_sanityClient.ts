import type { SanityDocument } from "@sanity/client";
import { sanityClient } from "sanity:client";

import cache from "./_cache";

export const fetch = async <
    T extends Record<string, any> = Record<string, any>,
>(
    queryString: string
) =>
    await cache.wrap(`SANITY:${queryString}`, async () => {
        try {
            const posts =
                await sanityClient.fetch<SanityDocument<T>[]>(queryString);
            return posts;
        } catch (err) {
            throw err;
        }
    });
