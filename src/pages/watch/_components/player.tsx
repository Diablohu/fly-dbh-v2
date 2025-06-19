import { memo, useMemo, useRef, type FC } from "react";
import { type ValidVideoSourceType } from "@/types";

import useWindowResizeScroll from "@/react-hooks/use-window-resize-scroll";
import useVideoSource from "@/react-hooks/use-video-source";
import getPlatformName from "@/utils/get-platform-name";

import styles from "./player.module.less";

// ============================================================================

type Props = {
    title: string;
    links: {
        bilibili: string;
        youtube: string;
        douyin: string;
    };
    cover: string;
    selectedVideoSource: ValidVideoSourceType;
};

// ============================================================================

const Player: FC<Props> = ({ links, title, cover, selectedVideoSource }) => {
    const PlayerRef = useRef<HTMLDivElement>(null);
    const [$videoSource] = useVideoSource(selectedVideoSource);

    useWindowResizeScroll((force?: boolean) => {
        if (PlayerRef.current) {
            PlayerRef.current.style.setProperty(
                "--player-height-shrink",
                `${window.scrollY}px`
            );
        }
    });

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

        const douyinId = /douyin\.com\/video\/(.+?)(\/|\?|\#|\&|$)/.exec(
            links[$videoSource]
        )?.[1];
        if (douyinId)
            return `//open.douyin.com/player/video?vid=${douyinId}&autoplay=1`;

        return "";
    }, [$videoSource, links]);

    return (
        <section className={styles["player"]} ref={PlayerRef}>
            <div className={styles["wrapper"]}>
                {!url ? (
                    <section
                        className={styles["no-valid-link"]}
                        style={{
                            backgroundImage: `url(${cover}?auto=format&w=960&blur=100&q=60)`,
                        }}
                    >
                        <p>
                            本视频暂无
                            <strong
                                className={styles[`platform-${$videoSource}`]}
                            >
                                {getPlatformName($videoSource)}
                            </strong>
                            版本
                        </p>
                        <p>请通过画面右上角更换视频平台</p>
                        {/* TODO: 自动弹出选项 */}
                    </section>
                ) : $videoSource === "bilibili" ? (
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
                ) : $videoSource === "douyin" ? (
                    <iframe
                        src={url}
                        title={title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="unsafe-url"
                        allowFullScreen
                    ></iframe>
                ) : null}
            </div>
        </section>
    );
};

export default memo(Player);
