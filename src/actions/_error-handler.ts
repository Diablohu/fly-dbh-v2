import { ActionError, type ActionAPIContext } from "astro:actions";
import logger from "@/services/logger";

function actionErrorHandler(err: unknown, context?: ActionAPIContext) {
    if (err instanceof ActionError) {
        const method = `${err.status}`[0] === "4" ? "warn" : "error";
        logger[method]({
            url: context?.url.href,
            type: err.type,
            name: err.name,
            status: err.status,
            code: err.code,
            message: err.message,
            cause: err.cause,
            stack: err.stack,
        });

        throw err;
    }

    console.trace(err);

    if (err instanceof Error)
        logger.error({
            url: context?.url.href,
            name: err.name,
            code: "INTERNAL_SERVER_ERROR",
            message: err.message,
            cause: err.cause,
            stack: err.stack,
        });
    else {
        logger.error({
            url: context?.url.href,
            code: "INTERNAL_SERVER_ERROR",
            message: typeof err === "string" ? err : JSON.stringify(err),
        });
    }

    throw new ActionError({
        message: err instanceof Error ? err.message : (err as string),
        code: "INTERNAL_SERVER_ERROR",
    });
}

export default actionErrorHandler;
