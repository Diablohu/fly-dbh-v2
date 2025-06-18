import { memo, useState, useMemo, type FC } from "react";

import styles from "./player.module.less";

// ============================================================================

type Props = {
    title: string;
    links: {
        bilibili: string;
        youtube: string;
        douyin: string;
    };
};

// ============================================================================

const Player: FC<Props> = ({ links, title }) => {
    const [source, setSource] = useState<keyof Props["links"]>("bilibili");

    const url = useMemo(() => {
        const bilibiliId = /bilibili\.com\/video\/(.+?)(\/|\?|\#|\&|$)/.exec(
            links[source]
        )?.[1];
        if (bilibiliId)
            return `//player.bilibili.com/player.html?isOutside=true&bvid=${bilibiliId}&p=1`;

        const youtubeId =
            /(youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/embed\/)(.+?)(\/|\?|\#|\&|$)/.exec(
                links[source]
            )?.[2];
        if (youtubeId) return `//youtube.com/embed/${youtubeId}?autoplay=1`;

        return links[source];
    }, [source, links]);

    return (
        <section className={styles["player"]}>
            {source === "bilibili" ? (
                <iframe
                    src={url}
                    title={title}
                    referrerPolicy="strict-origin-when-cross-origin"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                ></iframe>
            ) : source === "youtube" ? (
                <iframe
                    src={url}
                    title={title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                ></iframe>
            ) : null}
        </section>
    );
};

export default memo(Player);
