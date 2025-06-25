import { memo, useCallback, type FC, type MouseEventHandler } from "react";
import classNames from "classnames";
import { type ValidVideoSourceType, type VideoItemType } from "@/types";

import useVideoSource from "@/react-hooks/use-video-source";
import videoPlatforms from "@/constants/video-platforms";

import styles from "./select-platform.module.less";

// ============================================================================

const SelectPlatform: FC<{
    defaultVideoSource: ValidVideoSourceType;
    isInsidePlayer?: boolean;
    links: VideoItemType["links"];
}> = ({ defaultVideoSource, isInsidePlayer = false, links }) => {
    const [videoSource] = useVideoSource(defaultVideoSource);

    return (
        <section
            className={classNames([
                styles["select-platform"],
                {
                    [styles["mod-is-inside-player"]]: isInsidePlayer,
                },
            ])}
        >
            {!isInsidePlayer && <span>视频平台</span>}
            {videoPlatforms
                .filter(({ name }) =>
                    ["bilibili", "youtube", "douyin"]
                        .filter(
                            (source) =>
                                (isInsidePlayer && source !== videoSource) ||
                                !isInsidePlayer
                        )
                        .includes(name)
                )
                .map(({ name, title, iconType, iconHtml }) => (
                    <Item
                        key={name}
                        name={name as ValidVideoSourceType}
                        title={title}
                        iconType={iconType}
                        iconHtml={iconHtml}
                        defaultVideoSource={defaultVideoSource}
                        showLabel={isInsidePlayer}
                        url={links[name as "bilibili"]}
                    />
                ))}
        </section>
    );
};
export default SelectPlatform;

// ============================================================================

const Item: FC<{
    name: ValidVideoSourceType;
    title: string;
    iconType?: "png" | "svg";
    iconHtml?: string;
    defaultVideoSource: ValidVideoSourceType;
    showLabel?: boolean;
    url: string;
}> = memo(
    ({
        name,
        title,
        iconType,
        iconHtml = "",
        defaultVideoSource,
        showLabel = false,
        url,
    }) => {
        const [videoSource, setVideoSource] =
            useVideoSource(defaultVideoSource);
        const onClick = useCallback<MouseEventHandler<HTMLAnchorElement>>(
            (evt) => {
                evt.preventDefault();
                evt.stopPropagation();
                setVideoSource(name);
            },
            [setVideoSource]
        );

        return (
            <a
                href={url}
                className={classNames([
                    styles["item"],
                    styles[`item-${name}`],
                    {
                        [styles["is-active"]]: name === videoSource,
                    },
                ])}
                title={title}
                dangerouslySetInnerHTML={{
                    __html: [
                        iconType === "png"
                            ? `<img src="${iconHtml}" alt="${title}" />`
                            : iconType === "svg"
                              ? iconHtml
                              : "",
                        showLabel ? title : null,
                    ].join(""),
                }}
                onClick={onClick}
            ></a>
        );
    }
);
