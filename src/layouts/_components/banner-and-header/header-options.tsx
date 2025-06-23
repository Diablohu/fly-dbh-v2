import {
    useState,
    useCallback,
    memo,
    type FC,
    type MouseEventHandler,
} from "react";
import classNames from "classnames";

import symbolCogFill from "@/assets/svg-symbols/cog-fill.svg?raw";
import symbolCogHollow from "@/assets/svg-symbols/cog-hollow.svg?raw";

import Menu, { MenuTitleItem } from "@/components/menu";
// import isRouteActive from "@/utils/is-route-active";
import { type Props } from "./";

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
            />
            <Menu
                open={showMenu}
                setOpenState={setShowMenu}
                anchorPoint="bottomRight"
            >
                <MenuTitleItem>颜色主题</MenuTitleItem>
                <MenuTitleItem>视频播放平台</MenuTitleItem>
                <MenuTitleItem>列表自动加载更多</MenuTitleItem>
            </Menu>
            {/* TODO: 视频源改为下拉菜单内容，菜单中还包括亮暗切换 ☀ ☾ */}
        </>
    );
};

export default memo(HeaderOptions);
