import { routeNameSanityImageCdn } from "@/global";

export const transformImagePath = (pathname: string) =>
    `${routeNameSanityImageCdn}${pathname.replace(
        `images/${process.env.SANITY_PROJECT_ID}/${process.env.SANITY_DATASET}`,
        ""
    )}`;
