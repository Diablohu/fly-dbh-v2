import { memo, useMemo, type FC } from "react";
import { useStore } from "@nanostores/react";
import type { SanityDocument } from "@sanity/client";
import classNames from "classnames";

import { type ChallengeListItemType, type AircraftCategoryType } from "@/types";
import getChallengePageLink from "@/utils/get-challenge-page-link";

import {
    selectedDifficulties,
    selectedMaxAllowedAircraftCategories,
} from "../_store";

import styles from "./list.module.less";

// ============================================================================

const typicalAircraftTypes: Record<AircraftCategoryType, string> = {
    a: "轻型飞机 & 单发小型机",
    b: "支线客机 & 多发小型机",
    c: "干线客机 & 商务喷气机",
    d: "重型喷气机",
};

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
                    {typicalAircraftTypes[category]}
                </strong>
                <span className={styles["category-opaque-layer"]}>
                    CATEGORY {category.toUpperCase()}
                </span>
            </dt>
            <dd className={styles["challenges-list"]}>
                {items.map((item) => (
                    <a
                        className={styles["challenge-item"]}
                        href={getChallengePageLink(item.slug || item._id)}
                        key={item._id}
                        data-difficulty={item.difficulty}
                        // data-difficulty="rookie"
                    >
                        <span className={styles["aerodrome-code"]}>
                            {[item.aerodrome.icao, item.aerodrome.iata]
                                .filter(Boolean)
                                .join("/")}
                        </span>
                        <strong className={styles["aerodrome-name"]}>
                            {item.aerodrome.name}
                        </strong>
                        {item.difficulty === 3 && (
                            <span
                                className={classNames([
                                    styles["line"],
                                    styles["challenge-difficulty"],
                                ])}
                            >
                                相当挑战
                            </span>
                        )}
                        {item.difficulty === 5 && (
                            <span
                                className={classNames([
                                    styles["line"],
                                    styles["challenge-difficulty"],
                                ])}
                            >
                                极限挑战
                            </span>
                        )}
                        <span
                            className={classNames([
                                styles["line"],
                                styles["challenge-name"],
                            ])}
                        >
                            {item.name}
                        </span>
                        {Array.isArray(item.aerodrome.location) &&
                            item.aerodrome.location.length > 0 && (
                                <span
                                    className={classNames([
                                        styles["line"],
                                        styles["aerodrome-location"],
                                    ])}
                                >
                                    {item.aerodrome.location
                                        .filter(Boolean)
                                        .join(" ")}
                                </span>
                            )}
                    </a>
                ))}
            </dd>
        </dl>
    ));
};

export default memo(ChallengeList);
