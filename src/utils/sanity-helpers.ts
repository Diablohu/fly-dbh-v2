import { routeNameSanityImageCdn } from "@/global";

export const transformImagePath = (pathname: string) =>
    `${routeNameSanityImageCdn}${pathname.replace(
        `images/${process.env.SANITY_PROJECT_ID}/${process.env.SANITY_DATASET}`,
        ""
    )}`;

export const stringReplaceImagePath = (str: string) =>
    str.replace(
        new RegExp(
            `\"images/${process.env.SANITY_PROJECT_ID}/${process.env.SANITY_DATASET}/`,
            "gm"
        ),
        `"${routeNameSanityImageCdn}/`
    );
