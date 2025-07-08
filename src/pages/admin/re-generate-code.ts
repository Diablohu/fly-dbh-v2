import type { APIRoute } from "astro";
import { actions } from "astro:actions";

export const GET: APIRoute = async ({ callAction }) => {
    const { data, error } = await callAction(
        actions.adminReGenenerateTOTPKeyUri,
        {}
    );

    if (error) return new Response(error.code, { status: error.status });
    return new Response(JSON.stringify(data));
};
