import type { APIRoute } from "astro";
import sanityCache, { getCacheKey } from "@/services/sanity-cache";

/**
 * 接收 Sanity CMS 发来的 webhook
 *  - 任何文档在 create、update 和 delete 时都会发送该 webhook
 */
export const POST: APIRoute = async ({
    request,
    // cache
}) => {
    if (request.headers.get("Content-Type") === "application/json") {
        const body = await request.json();
        // console.log("CMS Webhook", { body });

        const cacheId =
            body?._type === "approach_challenge"
                ? getCacheKey(["challenges-details", body?.slug || body?._id])
                : undefined;

        if (cacheId) {
            try {
                await sanityCache.del(cacheId);
                // console.log("CMS Webhook received, cleared target cache", {
                //     body,
                //     cacheId,
                // });
                return new Response(
                    JSON.stringify({
                        message: `Webhook received, cleared cache "${cacheId}"`,
                    }),
                    {
                        status: 200,
                    },
                );
            } catch (e) {
                console.error(e);
            }
        }

        // return new Response("TODO");
        return new Response(
            JSON.stringify({
                message: "Webhook received, no action executed on server-side.",
            }),
            {
                status: 200,
            },
        );
    }
    // const data = await request.formData();
    // const { slug } = await request.json();

    // // Invalidate every response tagged 'products'...
    // await cache.invalidate({ tags: ["products"] });

    // // ...invalidate every page that used a particular entry...
    // await cache.invalidate({ tags: [`products:${slug}`] });

    // // ...or purge a single path directly.
    // await cache.invalidate({ path: `/products/${slug}` });

    return new Response(
        'Request Content-Type Error: Required "application/json"',
    );
};
