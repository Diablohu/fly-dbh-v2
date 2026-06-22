import type { APIRoute } from "astro";

export const POST: APIRoute = async (/*{ request, cache }*/) => {
    // const { slug } = await request.json();

    // // Invalidate every response tagged 'products'...
    // await cache.invalidate({ tags: ["products"] });

    // // ...invalidate every page that used a particular entry...
    // await cache.invalidate({ tags: [`products:${slug}`] });

    // // ...or purge a single path directly.
    // await cache.invalidate({ path: `/products/${slug}` });

    return new Response('TODO');
};
