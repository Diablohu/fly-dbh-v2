// export type LocaleType = "en" | "ja" | "zh";

// export type ReactComponentPropsWitchLocale<L = Record<string, string>> = {
//     _: L;
//     currentLocale: LocaleType;
// };
export type ValueOf<T> = T[keyof T];

// ============================================================================

export type SiteConfigsType = {
    key: string;
    value: string;
}[];

/** https://ogp.me/#types */
export type ValidPageContentType = "video-player" | "article" | "profile";
export type ValidVideoSourceType = "bilibili" | "youtube" | "douyin";
export type ValidColorSchemeType = "dark" | "light";
export type ValidContentListAutoLoadMoreType = "0" | "1";
export type ValidVideoItemShowPlatformLinksOnHoverType = "0" | "1";

// ============================================================================

export type AircraftCategoryType = "a" | "b" | "c" | "d";

// ============================================================================

export type VideoListPageTypeAircraftFamily = "aircraftFamily";
export type VideoListPageTypeAircraftOnboardDevice = "aircraftOnboardDevice";
export type VideoListPageTypesType =
    | "tag"
    | VideoListPageTypeAircraftFamily
    | VideoListPageTypeAircraftOnboardDevice
    | "aerodrome"
    | "developer"
    | "platform"
    | "platformUpdate"
    | "event";

export type VideoTagType = {
    type: VideoListPageTypesType;
    _id: string;
    name: string;
    slug?: string;
};

export type VideoItemType = {
    _id: string;
    slug?: string;
    title: string;
    release: string;
    cover: string;
    cover_dimensions?: {
        width: number;
        height: number;
    };
    duration?: number;
    tags: {
        _id: string;
        slug?: string;
        name: string;
    }[];

    description: string;
    sources: string;
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

// ============================================================================

export type ChallengeDifficultyType = "rookie" | "challenge" | "extreme";
export type ChallengeListItemType = {
    _id: string;
    slug: string;
    aerodrome: {
        _id: string;
        slug: string;
        name: string;
        icao: string;
        iata: string;
        location_region: string;
        location_city: string;
    };
    name: string;
    difficulty: ChallengeDifficultyType;
    max_allowed_aircraft_category: AircraftCategoryType;
};
export type ChallengeItemType = {
    _id: string;
    name: string;
    difficulty: ChallengeDifficultyType;
    max_allowed_aircraft_category: AircraftCategoryType;
    type: "vfr" | "ils" | "rnav" | "rnp-visual" | "ifr-circling";
    typical_aircrafts: string;
    hazards: {
        name: string;
        emoji: string;
        difficulty: string;
        comment?: string;
        extra_comment?: string;
    }[];
    aerodrome: {
        _id: string;
        slug: string;
        name: string;
        icao: string;
        iata: string;
        location_region: string;
        location_city: string;
        runways: {
            identifier: string;
            bearing: string;
            elevation: string;
            length: string;
            width: string;
        }[];
        photo?: string;
        photo_credit?: string;
        photo_credit_url?: string;
    };
    runways: string[];
};
