// export type LocaleType = "en" | "ja" | "zh";

// export type ReactComponentPropsWitchLocale<L = Record<string, string>> = {
//     _: L;
//     currentLocale: LocaleType;
// };

export type ValidVideoSourceType = "bilibili" | "youtube" | "douyin";

export type VideoListPageTypesType =
    | "tag"
    | "aircraftFamily"
    | "aerodrome"
    | "developer"
    | "platform"
    | "platformUpdate";

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
        bilibili: string;
        youtube: string;
        douyin: string;
    };

    aircraft_families: {
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
    msfs_updates: {
        _id: string;
        slug?: string;
        game: string;
        series: string;
        number: number;
        release: string;
    }[];
};
