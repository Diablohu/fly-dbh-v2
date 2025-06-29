import { actions } from "astro:actions";
import dayjs from "dayjs";
import { type VideoListPageTypesType } from "@/types";
import getVideoListPageLink from "@/utils/get-video-list-page-link";
import getGameUpdateName from "@/utils/get-game-update-name";

export type CategoryInfoType = {
    prefix?: string;
    name?: string;
    suffix?: string;
    route: string;
};

const getVideoCategoryInfoFromRawTypeData = (
    type: VideoListPageTypesType,
    raw: Omit<
        Exclude<
            Awaited<ReturnType<typeof actions.videoListPageFetchTags>>["data"],
            undefined
        >[0],
        "_rev" | "_type" | "_createdAt" | "_updatedAt" | '_originalId'
    >
): CategoryInfoType | undefined => {
    switch (type) {
        case "aircraftFamily":
            return {
                prefix: raw.maker,
                name: raw.name,
                route: getVideoListPageLink(
                    "aircraftFamily",
                    raw.slug || raw._id
                ),
            };

        case "aircraftOnboardDevice":
            return {
                prefix: raw.maker,
                name: raw.name,
                route: getVideoListPageLink(
                    "aircraftOnboardDevice",
                    raw.slug || raw._id
                ),
            };

        case "aerodrome":
            return {
                prefix: [raw.icao, raw.iata]
                    .map((s) => s?.toUpperCase())
                    .join(" / "),
                name: raw.name,
                route: getVideoListPageLink("aerodrome", raw.slug || raw._id),
            };

        case "developer":
            return {
                name: raw.name,
                route: getVideoListPageLink("developer", raw.slug || raw._id),
            };

        case "platform":
            return {
                name: raw.name,
                route: getVideoListPageLink("platform", raw.slug || raw._id),
            };

        case "platformUpdate":
            return {
                prefix: isNaN(raw.game as unknown as number)
                    ? raw.game
                    : `微软${raw.game}`,
                name: getGameUpdateName({
                    series: raw.series || "",
                    number: raw.number || "",
                }),
                suffix: dayjs(raw.release).format("YY年M月"),
                route: getVideoListPageLink(
                    "platformUpdate",
                    raw.slug || raw._id
                ),
            };

        case "event":
            return {
                name: raw.name,
                suffix: dayjs(raw.start).format("YY年M月"),
                route: getVideoListPageLink(
                    "event",
                    raw.slug || raw._id
                ),
            };
    }
    return undefined;
};

export default getVideoCategoryInfoFromRawTypeData;
