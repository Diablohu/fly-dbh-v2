import { type ChallengeListQueryConditionType } from "@/types";

// ============================================================================

const keys = {
    difficulties: "difficulties",
    types: "types",
    hazards: "hazards",
};

// ============================================================================

export const parseSearchParams = (searchParams: URLSearchParams) => {
    const difficulties = (searchParams.get(keys.difficulties)?.split(",") ||
        []) as unknown as ChallengeListQueryConditionType["difficulties"];
    const types = (searchParams.get(keys.types)?.split(",") ||
        []) as unknown as ChallengeListQueryConditionType["types"];
    const hazards = (searchParams.get(keys.hazards)?.split(",") ||
        []) as unknown as ChallengeListQueryConditionType["hazards"];
    return {
        difficulties,
        types,
        hazards,
    };
};

export const toString = (
    condition: Partial<
        Pick<
            ChallengeListQueryConditionType,
            "difficulties" | "types" | "hazards"
        >
    >,
) => {
    const searchParams = new URLSearchParams();
    if (condition.difficulties && condition.difficulties.length > 0) {
        searchParams.set(keys.difficulties, condition.difficulties.join(","));
    }
    if (condition.types && condition.types.length > 0) {
        searchParams.set(keys.types, condition.types.join(","));
    }
    if (condition.hazards && condition.hazards.length > 0) {
        searchParams.set(keys.hazards, condition.hazards.join(","));
    }
    return searchParams.toString();
};
