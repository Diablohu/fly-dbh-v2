import { atom } from "nanostores";
import {
    type AircraftCategoryType,
    type ChallengeDifficultyType,
} from "@/types";

// ============================================================================

export const selectedDifficulties = atom<ChallengeDifficultyType[]>([
    "rookie",
    "challenge",
    "extreme",
]);
export const selectedMaxAllowedAircraftCategories = atom<
    AircraftCategoryType[]
>(["a", "b", "c", "d"]);
