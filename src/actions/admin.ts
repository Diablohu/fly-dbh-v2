import {
    defineAction,
    ActionError,
    type ActionAPIContext,
} from "astro:actions";
import { z } from "astro:schema";
import { createTOTPKeyURI, verifyTOTPWithGracePeriod } from "@oslojs/otp";
import dayjs from "dayjs";
import { title } from "@/global";
import { adminTOTP, adminLoginValidPeriod } from "@/server-vars";
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
    adminReGenenerateTOTPKeyUri: defineAction({
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

    adminLogin: defineAction({
        input: z.string(),
        handler: async (code, context) => {
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
        },
    }),

    adminIsLoginValid: defineAction({
        handler: async (_, context) => {
            if (isLoginValid(context)) return true;

            context.cookies.delete(ADMIN_LAST_LOGIN);
            return false;
        },
    }),

    adminRefreshLoginCookie: defineAction({
        handler: async (_, context) => {
            if (!isLoginValid(context))
                throw new ActionError({ code: "UNAUTHORIZED" });
            return {
                expires: refreshCookie(context),
            };
        },
    }),
};

export default actions;
