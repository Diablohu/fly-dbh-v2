import { useRef, useEffect, useState, type FC } from "react";
import classNames from "classnames";

import { type ChallengeItemType } from "@/types";
import { routeBase } from "@/global";
import leftArrow from "@/assets/arrow/left3.svg?raw";

import styles from "./title.module.less";

// ============================================================================

const TitleBlock: FC<{
    aerodromeName: string;
    challengeName: string;
    airacCycle?: ChallengeItemType["airac_cyle"];
}> = ({ aerodromeName, challengeName, airacCycle }) => {
    const ProbeRef = useRef<HTMLSpanElement>(null);
    const ProbeObserverRef = useRef<IntersectionObserver>(null);
    const [isSticky, setSticky] = useState(false);

    useEffect(() => {
        if (!ProbeObserverRef.current)
            ProbeObserverRef.current = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            // console.log("inview");
                            setSticky(false);
                        } else {
                            // console.log("not inview");
                            setSticky(true);
                        }
                    });
                },
                { threshold: 0 }
            );

        if (ProbeRef.current)
            ProbeObserverRef.current?.observe(ProbeRef.current);

        return () => {
            if (ProbeObserverRef.current && ProbeRef.current) {
                ProbeObserverRef.current.unobserve(ProbeRef.current);
            }
            ProbeObserverRef.current?.disconnect();
        };
    }, []);

    return (
        <section
            className={classNames([
                styles["title-block"],
                {
                    [styles["is-sticky"]]: isSticky,
                },
            ])}
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
            <em className={styles["intersection-probe"]} ref={ProbeRef} />
            {airacCycle && (
                <span className={styles["airac-cycle"]}>
                    本文基于 AIRAC CYCLE <strong>{airacCycle}</strong>
                </span>
            )}
        </section>
    );
};

export default TitleBlock;
