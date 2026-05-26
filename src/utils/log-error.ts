import { ActionError } from "astro:actions";
import { errorLog } from "@/utils/log";

function logError(
    error: Error | ActionError,
    context?: {
        pathname?: string;
    },
) {
    if (!error || !(error instanceof Error)) return;

    console.log(" ");

    if ("code" in error)
        errorLog(
            [
                [
                    context?.pathname,
                    error.status || (error.code === "NOT_FOUND" ? "404" : "500"),
                ]
                    .filter(Boolean)
                    .join(" -> "),
                error.code,
                error.message,
            ]
                .filter(Boolean)
                .join(" | "),
        );
    else errorLog([error.message].filter(Boolean).join(" | "));

    if (typeof error.cause === "string") errorLog(`^^ CAUSE ^^ ${error.cause}`);
    else if ((error.cause as any)?.GROQ)
        errorLog(
            `^^ GROQ Query ^^ ${(error.cause as any)?.GROQ.replace(/\n\s+/gm, " ").replace(/\n/g, "")}`,
        );
}

export default logError;
