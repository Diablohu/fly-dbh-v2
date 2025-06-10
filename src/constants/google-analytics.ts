import { type LocaleType } from "@/types";

export function getIds(locale: LocaleType) {
    switch (locale) {
        case 'en': {
            return {
                gtag: "G-D13XHTPMNE",
                gtm: "GTM-M6G7QV27",
            };
        }
        case 'ja': {
            return {
                gtag: "G-8055C7Q6ZF",
                gtm: "GTM-M6G7QV27",
            };
        }
        case 'zh': {
            return {
                gtag: "G-1G8E999Y2X",
                gtm: "GTM-M6G7QV27",
            };
        }
        default: {
            return {
                gtag: "G-D13XHTPMNE",
                gtm: "GTM-M6G7QV27",
            };
        }
    }
}
