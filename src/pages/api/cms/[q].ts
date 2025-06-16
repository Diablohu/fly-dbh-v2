import type { APIRoute } from "astro";
import { fetch } from "@/services/sanity";

export const GET: APIRoute<
    {},
    {
        q: string;
    }
> = async ({ params, request, callAction }) => {
    if (!params.q) {
        return new Response(null, {
            status: 404,
            statusText: "Not found",
        });
    }
    return new Response(JSON.stringify(await fetch(params.q)));
};
