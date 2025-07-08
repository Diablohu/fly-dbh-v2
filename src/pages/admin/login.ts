import type { APIRoute } from "astro";
import { actions } from "astro:actions";

export const POST: APIRoute = async ({ request, callAction }) => {
    // const body = await request.json();
    const formdata = await request.formData();

    const { data, error } = await callAction(
        actions.adminLogin,
        formdata.get("code") as string
    );

    if (error) return new Response(error.code, { status: error.status });
    return new Response(JSON.stringify(data));
};
