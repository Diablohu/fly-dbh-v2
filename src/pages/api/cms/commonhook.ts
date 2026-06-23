import type { APIRoute } from "astro";
import cache, { getCacheId } from "@/services/cache";

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
            body?.type === "approach_challenge"
                ? getCacheId(["challenges-details", body?.slug || body?._id])
                : undefined;

        if (cacheId) {
            console.log("CMS Webhook", { body, cacheId });
            try {
                await cache.del(cacheId);
            } catch (e) {}
            return new Response(
                JSON.stringify({
                    message: `Cleared cache "${cacheId}"`,
                }),
                {
                    status: 200,
                },
            );
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
