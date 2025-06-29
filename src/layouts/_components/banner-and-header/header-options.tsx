import {
    useState,
    useCallback,
    memo,
    type FC,
    type MouseEventHandler,
    type HTMLAttributes,
} from "react";
import classNames from "classnames";

import symbolCogFill from "@/assets/svg-symbols/cog-fill.svg?raw";
import symbolCogHollow from "@/assets/svg-symbols/cog-hollow.svg?raw";

import Menu, {
    MenuItem,
    MenuTitleItem,
    MenuLineItem,
    MenuSwitchItem,
} from "@/components/menu";

import useColorScheme from "@/react-hooks/use-color-scheme";
import useVideoSource from "@/react-hooks/use-video-source";
import useContentListAutoLoadMore from "@/react-hooks/use-content-list-auto-load-more";
// import isRouteActive from "@/utils/is-route-active";
import { type Props } from "./";
import { links } from "./";

import styles from "./index.module.less";

// ============================================================================

const HeaderOptions: FC<Pick<Props, "defaults">> = ({ defaults }) => {
    const [showMenu, setShowMenu] = useState(false);

    const toggleMenu = useCallback(
        (evt: MouseEvent | Parameters<MouseEventHandler<HTMLElement>>[0]) => {
            evt.stopPropagation();
            setShowMenu((prev) => !prev);
        },
        []
    );

    return (
        <>
            <button
                type="button"
                className={classNames([
                    styles["button-options"],
                    {
                        [styles["is-active"]]: showMenu,
                    },
                ])}
                onClick={toggleMenu}
                dangerouslySetInnerHTML={{
                    __html: showMenu ? symbolCogFill : symbolCogHollow,
                }}
                aria-label="网站设置"
            />
            <Menu
                open={showMenu}
                setOpenState={setShowMenu}
                anchorPoint="bottomRight"
                className={styles["global-options"]}
            >
                <MenuTitleItem>颜色主题</MenuTitleItem>
                <OptionColorScheme defaultValue={defaults.forcedColorScheme} />
                <MenuLineItem />
                <MenuTitleItem>视频播放平台</MenuTitleItem>
                <OptionVideoSource defaultValue={defaults.videoSource} />
                <MenuLineItem />
                <OptionContentListAutoLoadMore
                    label="列表自动加载更多内容"
                    defaultValue={defaults.contentListAutoLoadMore}
                />
            </Menu>
        </>
    );
};

export default memo(HeaderOptions);

// ============================================================================

const OptionItem: FC<
    HTMLAttributes<HTMLButtonElement> & {
        isActive?: boolean;
    }
> = ({ className, isActive = false, ...props }) => {
    return (
        <button
            type="button"
            className={classNames([styles["option-item"], className], {
                [styles["is-active"]]: isActive,
            })}
            {...props}
        />
    );
};

// ============================================================================

const OptionColorScheme: FC<{
    defaultValue: Pick<Props, "defaults">["defaults"]["forcedColorScheme"];
}> = ({ defaultValue }) => {
    const [forcedColorScheme, setForcedColorScheme] =
        useColorScheme(defaultValue);

    const onClick = useCallback<MouseEventHandler<HTMLButtonElement>>(
        (evt) => {
            setForcedColorScheme(
                evt.currentTarget.getAttribute(
                    "data-value"
                ) as typeof defaultValue
            );
        },
        [setForcedColorScheme]
    );

    return (
        <MenuItem className={styles["option-switch-container"]}>
            {[
                ["暗色", "dark"],
                ["亮色", "light"],
                ["跟随系统", ""],
            ].map(([label, value]) => (
                <OptionItem
                    key={value}
                    isActive={(forcedColorScheme || "") === value}
                    data-value={value}
                    onClick={onClick}
                >
                    {label}
                </OptionItem>
            ))}
        </MenuItem>
    );
};

// ============================================================================

const OptionVideoSource: FC<{
    defaultValue: Pick<Props, "defaults">["defaults"]["videoSource"];
}> = ({ defaultValue }) => {
    const [videoSource, setVideoSource] = useVideoSource(defaultValue);

    const onClick = useCallback<MouseEventHandler<HTMLButtonElement>>(
        (evt) => {
            setVideoSource(
                evt.currentTarget.getAttribute(
                    "data-video-platform"
                ) as typeof defaultValue
            );
        },
        [setVideoSource]
    );

    return (
        <MenuItem className={styles["option-switch-container"]}>
            {links
                .filter(({ name }) =>
                    ["bilibili", "youtube", "douyin"].includes(name)
                )
                .map(({ name, title, iconType, iconHtml }) => (
                    <OptionItem
                        key={name}
                        isActive={videoSource === name}
                        data-video-platform={name}
                        onClick={onClick}
                        dangerouslySetInnerHTML={{
                            __html: [
                                iconType === "png"
                                    ? `<img src="${iconHtml}" alt="${title}" />`
                                    : iconType === "svg"
                                      ? iconHtml
                                      : "",
                                title,
                            ].join(""),
                        }}
                    />
                ))}
        </MenuItem>
    );
};

// ============================================================================

const OptionContentListAutoLoadMore: FC<{
    label?: string;
    defaultValue: Pick<
        Props,
        "defaults"
    >["defaults"]["contentListAutoLoadMore"];
}> = ({ label, defaultValue }) => {
    const [contentListAutoLoadMore, setContentListAutoLoadMore] =
        useContentListAutoLoadMore(defaultValue);

    const onChange = useCallback(
        (checked: boolean) => {
            setContentListAutoLoadMore(checked ? "1" : "0");
        },
        [contentListAutoLoadMore]
    );

    return (
        <MenuSwitchItem
            label={label}
            checked={contentListAutoLoadMore === "1"}
            onChange={onChange}
        />
    );
};
