import { memo, type FC } from "react";
import classNames from "classnames";

import { type ChallengeListItemType } from "@/types";
import { challengeDifficultyString, aircraftTypeString } from "@/global";
import getChallengePageLink from "@/utils/get-challenge-page-link";

import styles from "./challenge-item.module.less";

// ============================================================================

const ChallengeItem: FC<{
    className?: string;
    item: Partial<ChallengeListItemType> &
        Pick<ChallengeListItemType, "_id" | "name" | "difficulty">;
    /** 在难度行显示最大允许 Category */
    showCategory?: boolean;
}> = ({ item, className, showCategory = false }) => {
    return (
        <a
            className={classNames(styles["challenge-item"], className)}
            href={getChallengePageLink(item.slug || item._id)}
            key={item._id}
            data-difficulty={item.difficulty}
        >
            <span className={styles["aerodrome-code"]}>
                {item.aerodrome
                    ? [
                          item.aerodrome.icao || item.aerodrome.faa,
                          item.aerodrome.iata,
                      ]
                          .filter(Boolean)
                          .join("/")
                    : item.max_allowed_aircraft_category
                      ? `CATEGORY ${item.max_allowed_aircraft_category.toUpperCase()}`
                      : ""}
            </span>
            {item.aerodrome?.name && (
                <strong className={styles["aerodrome-name"]}>
                    {item.aerodrome.name}
                </strong>
            )}
            <strong className={styles["challenge-name"]}>{item.name}</strong>
            {
                // [1, 3, 5].includes(item.difficulty)
                item.difficulty && (
                    <span
                        className={classNames([
                            styles["line"],
                            styles["challenge-difficulty"],
                        ])}
                    >
                        {challengeDifficultyString[item.difficulty]}
                        {/* {showCategory && item.max_allowed_aircraft_category
                            ? `－${item.max_allowed_aircraft_category.toUpperCase()} 类飞机`
                            : ""} */}
                    </span>
                )
            }
            {Array.isArray(item.typical_aircraft_types) &&
                item.typical_aircraft_types
                    .filter(Boolean)
                    .map((type) => (
                        <span
                            className={classNames([
                                styles["line"],
                                styles["challenge-difficulty"],
                                styles["aerodrome-location"],
                            ])}
                        >
                            ・{aircraftTypeString[type]}
                        </span>
                    ))}
            {Array.isArray(item.aerodrome?.location) &&
                item.aerodrome?.location.length > 0 && (
                    <span
                        className={classNames([
                            styles["line"],
                            styles["aerodrome-location"],
                        ])}
                    >
                        {item.aerodrome.location.filter(Boolean).join(" ")}
                    </span>
                )}
            {item.aerodrome?.photo && (
                <img
                    className={styles["aerodrome-photo"]}
                    src={`${item.aerodrome.photo}?auto=format&w=400&blur=5&q=60`}
                    loading="lazy"
                />
            )}
        </a>
    );
};

export default memo(ChallengeItem);
