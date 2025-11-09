import { memo, type FC } from "react";
import classNames from "classnames";

import { type ChallengeListItemType } from "@/types";
import { challengeDifficultyString } from "@/global";
import getChallengePageLink from "@/utils/get-challenge-page-link";

import styles from "./list-item.module.less";

// ============================================================================

const ListItem: FC<{
    item: Partial<ChallengeListItemType> &
        Pick<ChallengeListItemType, "_id" | "name" | "difficulty">;
}> = ({ item }) => {
    return (
        <a
            className={styles["challenge-list-item"]}
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
                    </span>
                )
            }
            <span
                className={classNames([
                    styles["line"],
                    styles["challenge-name"],
                ])}
            >
                {item.name}
            </span>
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
        </a>
    );
};

export default memo(ListItem);
