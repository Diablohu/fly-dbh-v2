import {
    memo,
    useMemo,
    // useState,
    // useCallback,
    type FC,
    type AnchorHTMLAttributes,
} from "react";
import classNames from "classnames";

import { getVideoPageLink } from "@/global";
import { type VideoTagType, type VideoItemType } from "@/types";

import prettifyTitle from "@/utils/prettify-title";
import getDateString from "@/utils/get-date-string";

// import Menu, { MenuItem } from "@/components/menu";
import Symbol from "@/components/symbol";
// import DotsVerticalSvg from "@/assets/svg-symbols/dots-vertical.svg?raw";

import styles from "./video-item.module.less";

// ============================================================================

export type Props = Pick<Required<VideoItemType>, "_id" | "title" | "cover"> &
    Pick<Partial<VideoItemType>, "slug" | "duration" | "links"> & {
        tags?: Array<VideoTagType | string>;
        infos?: (
            | string
            | Date
            | VideoTagType
            | Array<string | Date | VideoTagType>
        )[];
        /**
         * 是否优先显示媒体资源
         * @default false
         */
        assetPriority?: "high" | false;
    };

// ============================================================================

const VideoItem: FC<Props & AnchorHTMLAttributes<HTMLAnchorElement>> & {
    getDurationText?: (duration: number) => string;
} = memo(
    ({
        _id,
        slug,
        title,
        cover,
        duration,
        tags,
        infos,
        links,
        className,
        assetPriority = false,
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

        // const [showMenu, setShowMenu] = useState(false);
        const prettifiedTitle = useMemo(() => prettifyTitle(title), [title]);
        // const onMenuHandleClick = useCallback(() => {
        //     setShowMenu(true);
        // }, []);

        return (
            <figure className={classNames([styles["video-item"], className])}>
                <a
                    className={styles["body"]}
                    href={getVideoPageLink(slug || _id)}
                    // href={searchString}
                    // onClick={onClick}
                    // data-astro-prefetch="false"
                >
                    <picture
                        className={styles["cover"]}
                        data-duration={
                            typeof duration === "number"
                                ? VideoItem.getDurationText?.(duration)
                                : undefined
                        }
                    >
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
                            loading={
                                assetPriority === "high" ? undefined : "lazy"
                            }
                            fetchPriority={
                                assetPriority === "high" ? "high" : undefined
                            }
                        />
                    </picture>

                    {Array.isArray(tags) && tags.length > 0 && (
                        <span
                            className={classNames([
                                styles["info-section"],
                                styles["tags"],
                            ])}
                        >
                            {tags.map((tag, index) => (
                                <span className={styles["tag"]} key={index}>
                                    {typeof tag === "string" ? tag : tag.name}
                                </span>
                            ))}
                        </span>
                    )}

                    <strong
                        className={classNames([
                            styles["info-section"],
                            styles["title"],
                        ])}
                    >
                        {prettifiedTitle}
                    </strong>

                    {Array.isArray(infos) &&
                        infos.length > 0 &&
                        infos.map((info, index) => (
                            <span
                                className={classNames([
                                    styles["info-section"],
                                    styles["infos"],
                                ])}
                                key={index}
                            >
                                {Array.isArray(info)
                                    ? info.map((i, index) => (
                                          <span key={index}>
                                              {i instanceof Date
                                                  ? getDateString(i)
                                                  : typeof i === "string"
                                                    ? i
                                                    : i.name}
                                          </span>
                                      ))
                                    : info instanceof Date
                                      ? getDateString(info)
                                      : typeof info === "string"
                                        ? info
                                        : info.name}
                            </span>
                        ))}
                </a>

                {/* <span className={styles["menu-handle"]}>
                    <span className={styles["wrapper"]}>
                        <button
                            type="button"
                            dangerouslySetInnerHTML={{
                                __html: DotsVerticalSvg,
                            }}
                            onClick={onMenuHandleClick}
                        />
                        <Menu
                            open={showMenu}
                            setOpenState={setShowMenu}
                            anchorPoint="bottomLeft"
                            grow={["down", "right"]}
                        >
                            <MenuItem>AAAAAAAAAA</MenuItem>
                        </Menu>
                    </span>
                </span> */}

                {!!links && (
                    <span className={styles["links"]}>
                        {Object.entries(links).map(([platform, url]) => (
                            <a
                                className={styles["platform"]}
                                href={url}
                                target="_blank"
                                rel="nofollow noopener noreferrer external"
                                data-platform={platform}
                                key={platform}
                            >
                                <Symbol
                                    name={
                                        platform === "douyin"
                                            ? "tiktok"
                                            : (platform as "bilibili")
                                    }
                                />
                            </a>
                        ))}
                    </span>
                )}
            </figure>
        );
    },
);
VideoItem.getDurationText = (duration: number) => {
    const h = Math.floor(duration / (60 * 60));
    const m = Math.floor((duration - h * 60 * 60) / 60);
    return [h > 0 ? h : null, m, duration % 60]
        .filter((number) => typeof number === "number")
        .map((number, index) =>
            index > 0 ? `${number}`.padStart(2, "0") : number,
        )
        .join(":");
};

export default VideoItem;
