import { createImageUrlBuilder } from "@sanity/image-url";

export const imageBuilder = createImageUrlBuilder({
    baseUrl: "/",
    projectId: import.meta.env.SANITY_PROJECT_ID || "",
    dataset: import.meta.env.SANITY_DATASET || "",
});
