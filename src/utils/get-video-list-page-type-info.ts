import { type VideoListPageTypesType } from "@/types";

const getVideoListPageTypeInfo = (t?: VideoListPageTypesType) => {
    switch (t) {
        case "tag":
            return { type: "tag", name: "类型" };
        case "aircraftFamily":
            return { type: "aircraft_family", name: "机型系列" };
        case "aircraftOnboardDevice":
            return { type: "aircraft_onboard_device", name: "机载设备" };
        case "aerodrome":
            return { type: "aerodrome", name: "机场" };
        case "developer":
            return { type: "developer", name: "开发商" };
        case "platform":
            return { type: "game", name: "平台" };
        case "platformUpdate":
            return { type: "msfs_update", name: "平台更新" };
        case "event":
            return { type: "event", name: "事件" };
    }
    return { type: "", name: "" };
};

export default getVideoListPageTypeInfo;
