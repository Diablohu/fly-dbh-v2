import { memo, type FC, type AnchorHTMLAttributes } from "react";
import classNames from "classnames";

import styles from "./video-item.module.less";

// ============================================================================

export type Props = {
    cmsId: string;
    title: string;
    cover: string;
    tags?: string[];
    infos?: string[];
};

// ============================================================================

const VideoItem: FC<Props & AnchorHTMLAttributes<HTMLAnchorElement>> = ({
    cmsId,
    title,
    cover,
    tags,
    infos,
    className,
}) => {
    return (
        <a
            className={classNames([styles["video-item"], className])}
            href={`?v=${cmsId}`}
            data-astro-prefetch="false"
        >
            <span className={styles["cover"]}>
                <img src={cover} alt={title} loading="lazy" />
            </span>

            {Array.isArray(tags) && tags.length > 0 && (
                <span className={styles["tags"]}>
                    {tags.map((tag, index) => (
                        <span className={styles["tag"]} key={index}>
                            {tag}
                        </span>
                    ))}
                </span>
            )}

            <strong>{title}</strong>

            {Array.isArray(infos) &&
                infos.length > 0 &&
                infos.map((info, index) => (
                    <span className={styles["info"]} key={index}>
                        {info}
                    </span>
                ))}
        </a>
    );
};

export default memo(VideoItem);
