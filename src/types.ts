import type { SanityDocument } from "@sanity/client";

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
    free_addons?: {
        platform: string;
        type: "first-party" | "third-party";
        msfs_package: "deluxe" | "premium-deluxe" | "update";
        url: string;
        extra: string;
    }[];
    free_addons_scenery?: AerodromeItemType["free_addons"];
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
    aerodromes: Array<
        Pick<
            AerodromeItemType,
            "_id" | "slug" | "icao" | "iata" | "faa" | "name"
        > & {
            challenges?: ChallengeItemType["other_challenges_this_aerodrome"];
        }
    >;
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
// #region Challenges

export type ChallengeDifficultyType = 1 | 3 | 5 | 7;
export type ChallengeListItemType = Pick<
    ChallengeItemType,
    | "_id"
    | "name"
    | "difficulty"
    | "max_allowed_aircraft_category"
    | "airac_cyle"
> & {
    slug: string;
    aerodrome: Pick<
        AerodromeItemType,
        "_id" | "slug" | "name" | "icao" | "iata" | "faa" | "location"
    > &
        Partial<Pick<AerodromeItemType, "photo">>;
};
export type ChallengeItemType = {
    _id: string;
    slug: string;
    name: string;
    type:
        | "vfr"
        | "vpt"
        | "ils"
        | "lda"
        | "igs"
        | "rnav"
        | "rnp-visual"
        | "rnp-ar"
        | "circling"
        | "circling-designated";
    airac_cyle: string;
    difficulty: ChallengeDifficultyType;
    max_allowed_aircraft_category: AircraftCategoryType;
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
        | "free_addons"
        | "free_addons_scenery"
    >;
    runways: string[];
    route: {
        origin?: Pick<
            AerodromeItemType,
            "_id" | "slug" | "name" | "icao" | "iata" | "faa"
        >;
        sid?: {
            rwy: string;
            sid: string;
        }[];
        enroute?: string;
        destination?: Pick<
            AerodromeItemType,
            "_id" | "slug" | "name" | "icao" | "iata" | "faa"
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
    >[];
    video_url_briefing: { name: string; url: string }[];
    video_this_aerodrome_extreme_airport: Pick<VideoItemType, "_id" | "slug">;
};

// #endregion
// ============================================================================
// #region Home Page
export type HomeVideoDocumentType = SanityDocument<
    Partial<VideoItemType> &
        Pick<VideoItemType, "_id" | "title" | "release" | "cover" | "tags">
>;
export type HomeCollectionsType = {
    config: SiteConfigsType;
    challenges: ChallengeListItemType[];
} & {
    [collection: string]: HomeVideoDocumentType[];
};
// #endregion
// ============================================================================
