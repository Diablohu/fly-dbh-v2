import { createClient, type SanityDocument } from "@sanity/client";

import cache from "./_cache";

// ============================================================================

export const client = createClient({
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET,
    // useCdn: false, // for static builds
    useCdn: true,
    // Set default headers to be included with all requests
    // headers: {
    //     "X-Custom-Header": "custom-value",
    // },
    apiVersion: "2025-06-18", // use current date (YYYY-MM-DD) to target the latest API version. Note: this should always be hard coded. Setting API version based on a dynamic value (e.g. new Date()) may break your application at a random point in the future.
    // token: process.env.SANITY_SECRET_TOKEN // Needed for certain operations like updating content, accessing drafts or using draft perspectives
});

// ============================================================================

export const fetch = async <
    T extends Record<string, any> = Record<string, any>,
>(
    queryString: string
) =>
    await cache.wrap(`SANITY:${queryString}`, async () => {
        try {
            const posts = await client.fetch<SanityDocument<T>[]>(queryString);
            return posts;
        } catch (err) {
            throw err;
        }
    });
