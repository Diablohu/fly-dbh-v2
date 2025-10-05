import { atom } from "nanostores";
import {
    type AircraftCategoryType,
    type ChallengeDifficultyType,
} from "@/types";

// ============================================================================

export const selectedDifficulties = atom<ChallengeDifficultyType[]>([1, 3, 5]);
export const selectedMaxAllowedAircraftCategories = atom<
    AircraftCategoryType[]
>(["a", "b", "c", "d"]);
