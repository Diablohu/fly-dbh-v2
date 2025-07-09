import fs from "fs-extra";
import {
    defineAction,
    ActionError,
    type ActionAPIContext,
} from "astro:actions";
import { z } from "astro:schema";
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
                    adminTOTP.digits
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
                    30
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
                if (isLoginValid(context)) return true;

                context.cookies.delete(ADMIN_LAST_LOGIN);
                return false;
            } catch (err) {
                actionErrorHandler(err);
            }
        },
    }),

    refreshLoginCookie: defineAction({
        handler: async (_, context) => {
            try {
                if (!isLoginValid(context))
                    throw new ActionError({ code: "UNAUTHORIZED" });
                return {
                    expires: refreshCookie(context),
                };
            } catch (err) {
                actionErrorHandler(err);
            }
        },
    }),

    getLogsList: defineAction({
        handler: async (_, context) => {
            try {
                const files = await fs.readdir(folderNameLogs);
                console.log(files);
                return files;
            } catch (err) {
                actionErrorHandler(err);
            }
        },
    }),
};

export default actions;
