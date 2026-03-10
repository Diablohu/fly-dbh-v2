import fs from "fs-extra";
import path from "node:path";
import {
    defineAction,
    ActionError,
    type ActionAPIContext,
} from "astro:actions";
import { z } from "astro/zod";
import { createTOTPKeyURI, verifyTOTPWithGracePeriod } from "@oslojs/otp";
import dayjs from "dayjs";
import { title } from "@/global";
import {
    adminTOTP,
    adminLoginValidPeriod,
    folderNameLogs,
} from "@/server-vars";
import { ADMIN_LAST_LOGIN } from "@/constants/cookies";

import actionErrorHandler from "./_error-handler";

// ============================================================================

const issuer = title;
const accountName = "Diablohu";

// ============================================================================

function isLoginValid(context: ActionAPIContext) {
    const lastLoggedIn = context.cookies.get(ADMIN_LAST_LOGIN)?.value;
    return (
        lastLoggedIn &&
        Date.now() - Number(lastLoggedIn) < adminLoginValidPeriod
    );
}
function refreshCookie(context: ActionAPIContext) {
    const now = Date.now();
    const expiresTimestamp = now + adminLoginValidPeriod;
    context.cookies.set(ADMIN_LAST_LOGIN, now.toString(), {
        path: "/admin",
        expires: dayjs(expiresTimestamp).toDate(),
    });

    return expiresTimestamp;
}
function handlerWrapper<R>(
    context: ActionAPIContext,
    func: () => R | Promise<R>,
) {
    try {
        if (!isLoginValid(context))
            throw new ActionError({ code: "UNAUTHORIZED" });
        return func();
    } catch (err) {
        actionErrorHandler(err);
    }
}

// ============================================================================

const actions = {
    reGenenerateTOTPKeyUri: defineAction({
        handler: async () => {
            if (!import.meta.env.DEV)
                throw new ActionError({ code: "UNAUTHORIZED" });

            try {
                const uri = createTOTPKeyURI(
                    issuer,
                    accountName,
                    adminTOTP.key,
                    adminTOTP.intervalInSeconds,
                    adminTOTP.digits,
                );

                return { uri };
            } catch (err) {
                actionErrorHandler(err);
            }
        },
    }),

    login: defineAction({
        accept: "form",
        input: z.object({
            code: z.string(),
        }),
        handler: async ({ code }, context) => {
            try {
                const valid = verifyTOTPWithGracePeriod(
                    adminTOTP.key,
                    adminTOTP.intervalInSeconds,
                    adminTOTP.digits,
                    code,
                    30,
                );

                if (!valid) throw new ActionError({ code: "UNAUTHORIZED" });

                return {
                    expires: refreshCookie(context),
                };
            } catch (err) {
                actionErrorHandler(err);
            }
        },
    }),

    isLoginValid: defineAction({
        handler: async (_, context) => {
            try {
                if (isLoginValid(context)) {
                    refreshCookie(context);
                    return true;
                }

                context.cookies.delete(ADMIN_LAST_LOGIN);
                return false;
            } catch (err) {
                actionErrorHandler(err);
            }
        },
    }),

    refreshLoginCookie: defineAction({
        handler: async (_, context) =>
            handlerWrapper<{ expires: number }>(context, async () => ({
                expires: refreshCookie(context),
            })),
    }),

    getLogsList: defineAction({
        handler: async (_, context) =>
            handlerWrapper<string[]>(context, async () => {
                const files = (await fs.readdir(folderNameLogs)).filter((f) =>
                    /\d+\-\d+\-\d+\.combined\./.test(f),
                );
                return files;
            }),
    }),

    readLog: defineAction({
        input: z.object({
            filename: z.string(),
        }),
        handler: async ({ filename }, context) =>
            handlerWrapper(context, async () => {
                const file = path.resolve(folderNameLogs, filename);
                if (!fs.existsSync(file))
                    throw new ActionError({ code: "NOT_FOUND" });
                return await fs.readFile(file, "utf-8");
            }),
    }),
};

export default actions;
