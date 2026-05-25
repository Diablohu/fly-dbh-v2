import {
    ActionError,
    type ActionAPIContext,
    type ActionErrorCode,
} from "astro:actions";
// import { E_0000 } from "@/constants/error-codes";
import logError from "@/utils/log-error";

function pageDataErrorHandler(
    error: ActionError | ActionErrorCode,
    context: ActionAPIContext,
): {
    redirect?: string;
    rewrite?: string;
} {
    if (typeof error === "string")
        return pageDataErrorHandler(new ActionError({ code: error }), context);

    logError(error, {
        pathname: context?.originPathname,
    });

    if ((error.status + "").startsWith("4")) return { rewrite: "/404" };

    return { rewrite: "/500" };
}

export default pageDataErrorHandler;
