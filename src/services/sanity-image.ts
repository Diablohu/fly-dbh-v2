import { createImageUrlBuilder } from "@sanity/image-url";

export const imageBuilder = createImageUrlBuilder({
    baseUrl: "/",
    projectId: process.env.SANITY_PROJECT_ID || "",
    dataset: process.env.SANITY_DATASET || "",
});
