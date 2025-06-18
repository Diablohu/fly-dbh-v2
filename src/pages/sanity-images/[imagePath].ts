import { type APIRoute } from "astro";

const target = `https://cdn.sanity.io/images/${process.env.SANITY_PROJECT_ID}/${process.env.SANITY_DATASET}`;

export const ALL: APIRoute = async ({ request, params, url }) => {
    const fullUrl = `${target}/${params.imagePath}${url.search}`;
    // console.log({ fullUrl });
    try {
        return await fetch(fullUrl, request);
    } catch (e) {
        console.log(e);
        console.trace(e);
        return new Response("");
    }
};
