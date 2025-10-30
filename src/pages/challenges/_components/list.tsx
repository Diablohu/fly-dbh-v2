import { memo, useMemo, type FC } from "react";
import { useStore } from "@nanostores/react";
import type { SanityDocument } from "@sanity/client";
import classNames from "classnames";

import { type ChallengeListItemType, type AircraftCategoryType } from "@/types";
import {
    challengeDifficultyString,
    aircraftCategoryTypeString,
} from "@/global";
import getChallengePageLink from "@/utils/get-challenge-page-link";

import {
    selectedDifficulties,
    selectedMaxAllowedAircraftCategories,
} from "../_store";

import ListItem from "./list-item";

import styles from "./list.module.less";

// ============================================================================

const ChallengeList: FC<{
    list: SanityDocument<ChallengeListItemType>[];
}> = ({ list }) => {
    const $difficulties = useStore(selectedDifficulties);
    const $aircraftCategories = useStore(selectedMaxAllowedAircraftCategories);

    const filteredListByAircraftCategory = useMemo(() => {
        const result = {} as Record<
            AircraftCategoryType,
            SanityDocument<ChallengeListItemType>[]
        >;

        list.filter(
            ({ difficulty, max_allowed_aircraft_category }) =>
                $difficulties.includes(difficulty) &&
                $aircraftCategories.includes(max_allowed_aircraft_category)
        ).forEach((item) => {
            if (!result[item.max_allowed_aircraft_category]) {
                result[item.max_allowed_aircraft_category] = [];
            }
            result[item.max_allowed_aircraft_category].push(item);
        });

        return Object.entries(result).sort(([a], [b]) =>
            a > b ? 1 : a === b ? 0 : -1
        ) as [AircraftCategoryType, SanityDocument<ChallengeListItemType>[]][];
    }, [list, $difficulties, $aircraftCategories]);

    return filteredListByAircraftCategory.map(([category, items]) => (
        <dl key={category} className={styles["category-list"]}>
            <dt className={styles["category-title"]}>
                <span className={styles["category-code"]}>
                    CATEGORY {category.toUpperCase()}
                </span>
                <strong className={styles["typical-aircraft-types"]}>
                    {aircraftCategoryTypeString[category]}
                </strong>
                <span className={styles["category-opaque-layer"]}>
                    CATEGORY {category.toUpperCase()}
                </span>
            </dt>
            <dd className={styles["challenges-list"]}>
                {items.map((item) => (
                    <ListItem item={item} key={item._id} />
                ))}
            </dd>
        </dl>
    ));
};

export default memo(ChallengeList);
