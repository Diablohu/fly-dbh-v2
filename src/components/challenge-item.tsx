import { memo, useMemo, type FC } from "react";
import classNames from "classnames";

import { type ChallengeListItemType, type ChallengeItemType } from "@/types";
import { challengeDifficultyString, aircraftTypeString } from "@/global";
import getChallengePageLink from "@/utils/get-challenge-page-link";

import styles from "./challenge-item.module.less";

// ============================================================================

const ChallengeItem: FC<{
    className?: string;
    item: Partial<ChallengeListItemType> &
        Pick<ChallengeListItemType, "_id" | "name" | "difficulty"> &
        Partial<Exclude<ChallengeItemType, "aerodrome">>;
    /** 在难度行显示最大允许 Category */
    showMaxCategory?: boolean;
    /** 在难度下方显示飞机类型 */
    showAircraftTypes?: boolean;
    /**
     * 如果数据中有提供难点灾害，显示
     * - 默认不显示
     */
    showHazards?: boolean;
}> = ({
    item,
    className,
    showMaxCategory = false,
    showAircraftTypes = false,
    showHazards = false,
}) => {
    return (
        <a
            className={classNames(styles["challenge-item"], className)}
            href={getChallengePageLink(item.slug || item._id)}
            key={item._id}
            data-difficulty={item.difficulty}
        >
            <span
                className={styles["aerodrome-code"]}
                dangerouslySetInnerHTML={{
                    __html: item.aerodrome
                        ? [
                              (item.aerodrome.icao
                                  ? item.aerodrome.is_fake_icao
                                      ? `<del>${item.aerodrome.icao}</del>`
                                      : item.aerodrome.icao
                                  : "") || item.aerodrome.faa,
                              item.aerodrome.iata,
                              item.aerodrome.designator,
                          ]
                              .filter(Boolean)
                              .map((str) =>
                                  item.aerodrome?.is_closed
                                      ? `<del>${str}</del>`
                                      : str,
                              )
                              .join("/")
                        : item.max_allowed_aircraft_category
                          ? `CATEGORY ${item.max_allowed_aircraft_category.toUpperCase()}`
                          : "",
                }}
            />
            {item.aerodrome?.name && (
                <strong className={styles["aerodrome-name"]}>
                    {item.aerodrome.is_closed && "（旧）"}
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
                        {showMaxCategory && item.max_allowed_aircraft_category
                            ? `－${item.max_allowed_aircraft_category.toUpperCase()} 类飞机`
                            : ""}
                    </span>
                )
            }
            {showAircraftTypes &&
                Array.isArray(item.typical_aircraft_types) &&
                item.typical_aircraft_types
                    .filter(Boolean)
                    .map((type, index) => (
                        <span
                            className={classNames([
                                styles["line"],
                                styles["challenge-difficulty"],
                                styles["aerodrome-location"],
                            ])}
                            key={index}
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
            {showHazards &&
                Array.isArray(item.hazards) &&
                item.hazards.length > 0 && (
                    <span className={styles["hazards"]}>
                        {item.hazards.map((hazard, index) => (
                            <span
                                key={index}
                                className={styles["hazard"]}
                                data-difficulty={hazard.difficulty}
                            >
                                <em
                                    className={styles["icon"]}
                                    aria-hidden="true"
                                >
                                    {hazard.emoji}
                                </em>
                                {hazard.name}
                            </span>
                        ))}
                    </span>
                )}
        </a>
    );
};

export default memo(ChallengeItem);
