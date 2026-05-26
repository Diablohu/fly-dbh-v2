import { type AstroGlobal } from "astro";
import {
    ActionError,
    type ActionAPIContext,
    type ActionErrorCode,
} from "astro:actions";
// import { E_0000 } from "@/constants/error-codes";
import logError from "@/utils/log-error";

function pageDataErrorHandler(
    error: ActionError | ActionErrorCode,
    context: AstroGlobal | ActionAPIContext,
): {
    redirect?: string;
    rewrite?: string;
} {
    if (typeof error === "string")
        return pageDataErrorHandler(new ActionError({ code: error }), context);

    logError(error, {
        pathname: context?.originPathname,
    });

    if ("response" in context) context.response.status = error.status;

    if ((error.status + "").startsWith("4")) return { rewrite: "/404" };

    if ("props" in context) context.props.error = error;
    return { rewrite: "/500" };
}

export default pageDataErrorHandler;
