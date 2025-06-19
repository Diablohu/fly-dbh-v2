import {
    memo,
    // useCallback,
    useMemo,
    type FC,
    type AnchorHTMLAttributes,
    // type MouseEventHandler,
} from "react";
import classNames from "classnames";

import prettifyTitle from "@/utils/prettify-title";
import getDateString from "@/utils/get-date-string";

import styles from "./video-item.module.less";

// ============================================================================

export type Props = {
    cmsId: string;
    slug?: string;
    title: string;
    cover: string;
    tags?: string[];
    infos?: (string | Date)[];
};

// ============================================================================

const VideoItem: FC<Props & AnchorHTMLAttributes<HTMLAnchorElement>> = ({
    cmsId,
    slug,
    title,
    cover,
    tags,
    infos,
    className,
}) => {
    // const searchString = useMemo(() => `?v=${cmsId}`, [cmsId]);
    // const onClick = useCallback<MouseEventHandler<HTMLAnchorElement>>(
    //     (evt) => {
    //         evt.preventDefault();

    //         window._browserHistory?.push({
    //             search: searchString,
    //         });
    //     },
    //     [searchString]
    // );

    const prettifiedTitle = useMemo(() => prettifyTitle(title), [title]);

    return (
        <a
            className={classNames([styles["video-item"], className])}
            href={`/watch/${slug || cmsId}`}
            // href={searchString}
            // onClick={onClick}
            data-astro-prefetch="false"
        >
            <span className={styles["cover"]}>
                <img src={cover} alt={prettifiedTitle} loading="lazy" />
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

            <strong>{prettifiedTitle}</strong>

            {Array.isArray(infos) &&
                infos.length > 0 &&
                infos.map((info, index) => (
                    <span className={styles["info"]} key={index}>
                        {info instanceof Date ? getDateString(info) : info}
                    </span>
                ))}
        </a>
    );
};

export default memo(VideoItem);
