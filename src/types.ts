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

export type AerodromeItemType = {
    _id: string;
    slug: string;
    name: string;
    icao: string;
    iata: string;
    faa: string;
    location: string[];
    runways: {
        identifier: string;
        bearing: string;
        elevation: string;
        length: string;
        width: string;
        /** 覆盖跑道坡度数据，存在时优先使用，不按高度和长度进行计算 */
        slope: string;
    }[];
    photo?: string;
    photo_credit?: string;
    photo_credit_url?: string;
};

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
    aerodromes: Pick<
        AerodromeItemType,
        "_id" | "slug" | "icao" | "iata" | "faa" | "name"
    >[];
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

export type ChallengeDifficultyType = 1 | 3 | 5;
export type ChallengeListItemType = {
    _id: string;
    slug: string;
    aerodrome: Pick<
        AerodromeItemType,
        "_id" | "slug" | "name" | "icao" | "iata" | "faa" | "location"
    >;
    name: string;
    difficulty: ChallengeDifficultyType;
    max_allowed_aircraft_category: AircraftCategoryType;
};
export type ChallengeItemType = {
    _id: string;
    name: string;
    difficulty: ChallengeDifficultyType;
    max_allowed_aircraft_category: AircraftCategoryType;
    type:
        | "vfr"
        | "ils"
        | "rnav"
        | "rnp-visual"
        | "circling"
        | "circling-designated";
    typical_aircrafts: string;
    hazards: {
        name: string;
        emoji: string;
        difficulty: ChallengeDifficultyType;
        comment?: string;
        extra_comment?: string;
    }[];
    aerodrome: Pick<
        AerodromeItemType,
        | "_id"
        | "slug"
        | "name"
        | "icao"
        | "iata"
        | "faa"
        | "location"
        | "runways"
        | "photo"
        | "photo_credit"
        | "photo_credit_url"
    >;
    runways: string[];
    route: {
        origin?: Pick<
            AerodromeItemType,
            "_id" | "slug" | "name" | "icao" | "iata"
        >;
        sid?: {
            rwy: string;
            sid: string;
        }[];
        enroute?: string;
        destination?: Pick<
            AerodromeItemType,
            "_id" | "slug" | "name" | "icao" | "iata"
        >;
        star?: {
            rwy: string;
            star: string;
        }[];
        app?: string;
        distance?: number;
        cruise?: string;
    };
    briefing?: string;
    other_challenges_this_aerodrome: Array<
        Pick<
            ChallengeItemType,
            "_id" | "name" | "difficulty" | "max_allowed_aircraft_category"
        > & {
            slug: string;
        }
    >;
    videos_this_aerodrome: Pick<
        VideoItemType,
        | "_id"
        | "slug"
        | "title"
        | "release"
        | "duration"
        | "cover"
        | "tags"
        | "links"
    >;
};
