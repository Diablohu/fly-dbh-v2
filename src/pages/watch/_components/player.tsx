import { memo, useMemo, type FC } from "react";
import { type ValidVideoSourceType } from "@/types";

import useVideoSource from "@/react-hooks/use-video-source";

import styles from "./player.module.less";

// ============================================================================

type Props = {
    title: string;
    links: {
        bilibili: string;
        youtube: string;
        douyin: string;
    };
    selectedVideoSource: ValidVideoSourceType;
};

// ============================================================================

const Player: FC<Props> = ({ links, title, selectedVideoSource }) => {
    const [$videoSource] = useVideoSource(selectedVideoSource);

    const url = useMemo(() => {
        const bilibiliId = /bilibili\.com\/video\/(.+?)(\/|\?|\#|\&|$)/.exec(
            links[$videoSource]
        )?.[1];
        if (bilibiliId)
            return `//player.bilibili.com/player.html?isOutside=true&bvid=${bilibiliId}&p=1`;

        const youtubeId =
            /(youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/embed\/)(.+?)(\/|\?|\#|\&|$)/.exec(
                links[$videoSource]
            )?.[2];
        if (youtubeId) return `//youtube.com/embed/${youtubeId}?autoplay=1`;

        return links[$videoSource];
    }, [$videoSource, links]);

    return (
        <section className={styles["player"]}>
            {$videoSource === "bilibili" ? (
                <iframe
                    src={url}
                    title={title}
                    referrerPolicy="strict-origin-when-cross-origin"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                ></iframe>
            ) : $videoSource === "youtube" ? (
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
