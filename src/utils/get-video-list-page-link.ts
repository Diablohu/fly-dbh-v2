import { type VideoListPageTypesType } from "@/types";
import { routeBase } from "@/global";

function getVideoListPageLink(type?: VideoListPageTypesType, slug?: string) {
    if (!type) return routeBase.videoList;
    if (!slug) return routeBase.videoList;
    return (
        routeBase.videoList +
        `/${
            type === "aircraftFamily"
                ? "aircraftfamily"
                : type === "aircraftOnboardDevice"
                  ? "aircraftonboarddevice"
                  : type === "platformUpdate"
                    ? "platformupdate"
                    : type
        }-${slug}`
    );
}

export default getVideoListPageLink;
