import { ActionError, type ActionAPIContext } from "astro:actions";

function actionErrorHandler(err: unknown, context?: ActionAPIContext) {
    if (err instanceof ActionError) throw err;

    console.trace(err);
    throw new ActionError({
        message: err instanceof Error ? err.message : (err as string),
        code: "INTERNAL_SERVER_ERROR",
    });
}

export default actionErrorHandler;
