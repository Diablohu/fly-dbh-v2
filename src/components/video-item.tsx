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
            <picture className={styles["cover"]}>
                <source
                    srcSet={[
                        `${cover}?fm=webp&w=400&q=60`,
                        `${cover}?fm=webp&w=${400 * 1.5}&q=60 1.5x`,
                    ].join(", ")}
                    type="image/webp"
                />
                <img
                    src={cover + "?auto=format&w=400&q=60"}
                    alt={prettifiedTitle}
                    loading="lazy"
                />
            </picture>

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
