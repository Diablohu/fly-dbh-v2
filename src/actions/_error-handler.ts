import { ActionError } from "astro:actions";

function actionErrorHandler(err: unknown) {
    console.trace(err);
    throw new ActionError({
        message: err instanceof Error ? err.message : (err as string),
        code: "INTERNAL_SERVER_ERROR",
    });
}

export default actionErrorHandler;
