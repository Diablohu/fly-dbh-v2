import { memo, useCallback, type FC } from "react";
import classNames from "classnames";
import { type ValidVideoSourceType } from "@/types";

import useVideoSource from "@/react-hooks/use-video-source";
import { links } from "@/layouts/_components/banner-and-header";

import styles from "./select-platform.module.less";

// ============================================================================

const SelectPlatform: FC<{
    selectedVideoSource: ValidVideoSourceType;
    isInsidePlayer?: boolean;
}> = ({ selectedVideoSource, isInsidePlayer = false }) => {
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
            {links
                .filter(({ name }) =>
                    ["bilibili", "youtube", "douyin"]
                        .filter(
                            (source) =>
                                (isInsidePlayer &&
                                    source !== selectedVideoSource) ||
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
                        selectedVideoSource={selectedVideoSource}
                        showLabel={isInsidePlayer}
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
    selectedVideoSource: ValidVideoSourceType;
    showLabel?: boolean;
}> = memo(
    ({
        name,
        title,
        iconType,
        iconHtml = "",
        selectedVideoSource,
        showLabel = false,
    }) => {
        const [$videoSource, setVideoSource] =
            useVideoSource(selectedVideoSource);
        const onClick = useCallback(() => {
            setVideoSource(name);
        }, [setVideoSource]);

        return (
            <button
                type="button"
                className={classNames([
                    styles["item"],
                    styles[`item-${name}`],
                    {
                        [styles["is-active"]]: name === $videoSource,
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
            ></button>
        );
    }
);
