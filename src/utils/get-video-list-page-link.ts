import { type VideoListPageTypesType } from "@/types";

const getVideoListPageLink = (type?: VideoListPageTypesType, slug?: string) => {
    if (!type) return "/videos";
    if (!slug) return "/videos";
    return `/videos/${
        type === "aircraftFamily"
            ? "aircraftfamily"
            : type === "platformUpdate"
              ? "platformupdate"
              : type
    }-${slug}`;
};

export default getVideoListPageLink;
