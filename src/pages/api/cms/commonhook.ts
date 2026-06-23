import type { APIRoute } from "astro";

/**
 * 接收 Sanity CMS 发来的 webhook
 *  - 任何文档在 create、update 和 delete 时都会发送该 webhook
 */
export const POST: APIRoute = async ({
    request,
    // cache
}) => {
    // const data = await request.formData();
    console.log("CMS Webhook", request.body);
    // const { slug } = await request.json();

    // // Invalidate every response tagged 'products'...
    // await cache.invalidate({ tags: ["products"] });

    // // ...invalidate every page that used a particular entry...
    // await cache.invalidate({ tags: [`products:${slug}`] });

    // // ...or purge a single path directly.
    // await cache.invalidate({ path: `/products/${slug}` });

    return new Response("TODO");
};
