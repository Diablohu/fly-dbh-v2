// export type LocaleType = "en" | "ja" | "zh";

// export type ReactComponentPropsWitchLocale<L = Record<string, string>> = {
//     _: L;
//     currentLocale: LocaleType;
// };
export type ValueOf<T> = T[keyof T];

export type ValidVideoSourceType = "bilibili" | "youtube" | "douyin";
export type ValidColorSchemeType = "dark" | "light";
export type ValidContentListAutoLoadMoreType = "0" | "1";

export type VideoListPageTypesType =
    | "tag"
    | "aircraftFamily"
    | "aircraftOnboardDevice"
    | "aerodrome"
    | "developer"
    | "platform"
    | "platformUpdate"
    | "event";

export type VideoItemType = {
    _id: string;
    slug?: string;
    title: string;
    release: string;
    cover: string;
    tags: {
        _id: string;
        slug?: string;
        name: string;
    }[];

    description: string;
    links: {
        [platform in ValidVideoSourceType]?: string;
    };

    aircraft_families: {
        _id: string;
        slug?: string;
        maker: string;
        name: string;
    }[];
    aircraft_onboard_devices: {
        _id: string;
        slug?: string;
        maker: string;
        name: string;
    }[];
    aerodromes: {
        _id: string;
        slug?: string;
        icao: string;
        iata: string;
        name: string;
    }[];
    developers: {
        _id: string;
        slug?: string;
        name: string;
    }[];
    games: {
        _id: string;
        slug?: string;
        name: string;
    }[];
    game_updates: {
        _id: string;
        slug?: string;
        game: string;
        series: string;
        number: number;
        release: string;
    }[];
    events: {
        _id: string;
        slug?: string;
        name: string;
        start: string;
        end: string;
    }[];
};
