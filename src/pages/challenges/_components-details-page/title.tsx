import { useRef, type FC } from "react";
import classNames from "classnames";

import { type ChallengeItemType } from "@/types";
import { routeBase } from "@/global";
import useSticky from "@/react-hooks/use-sticky";
import leftArrow from "@/assets/arrow/left3.svg?raw";

import styles from "./title.module.less";

// ============================================================================

const TitleBlock: FC<{
    aerodromeName: string;
    challengeName: string;
    airacCycle?: ChallengeItemType["airac_cyle"];
}> = ({ aerodromeName, challengeName, airacCycle }) => {
    const ContainerRef = useRef<HTMLElement>(null);
    const { isSticky } = useSticky({ ContainerRef });

    return (
        <section
            className={classNames([
                styles["title-block"],
                {
                    [styles["is-sticky"]]: isSticky,
                },
            ])}
            ref={ContainerRef}
        >
            <a
                className={styles["link-to-challenge-list"]}
                href={routeBase.challenges}
                dangerouslySetInnerHTML={{
                    __html: `${leftArrow}着陆挑战名册`,
                }}
            />
            <h1>
                <strong className={styles["aerodrome-name"]}>
                    {aerodromeName}进近挑战
                </strong>
                <small className={styles["challenge-name"]}>
                    {challengeName}
                </small>
            </h1>
            <span
                className={classNames([
                    styles["airac-cycle"],
                    {
                        [`${styles["is-unfinished"]}`]: !airacCycle,
                    },
                ])}
            >
                {airacCycle ? (
                    <>
                        本文基于 AIRAC CYCLE <strong>{airacCycle}</strong>
                    </>
                ) : (
                    "本页内容正在完善中"
                )}
            </span>
        </section>
    );
};

export default TitleBlock;
