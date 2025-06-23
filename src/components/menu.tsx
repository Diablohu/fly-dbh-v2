import {
    useState,
    useCallback,
    useEffect,
    useRef,
    memo,
    type FC,
    type MenuHTMLAttributes,
    type HTMLAttributes,
    type MouseEventHandler,
    type TransitionEventHandler,
    type AnimationEventHandler,
    type Dispatch,
    type SetStateAction,
} from "react";
import { createPortal } from "react-dom";
import classNames from "classnames";

import useWindow from "@/react-hooks/use-window";

import styles from "./menu.module.less";

// ============================================================================

const Menu: FC<
    {
        open?: boolean;
        setOpenState?: Dispatch<SetStateAction<boolean>>;
        onClose?: () => unknown;
        anchorPoint?: "topLeft" | "topRight" | "bottomRight" | "bottomLeft";
    } & Pick<MenuHTMLAttributes<HTMLMenuElement>, "children">
> = ({
    open: _open = false,
    setOpenState: _setOpenState,
    onClose,
    anchorPoint = "topLeft",
    children,
}) => {
    const MenuRef = useRef<HTMLMenuElement>(null);
    const AnchorRef = useRef<HTMLElement>(null);
    const AnchorProbeRef = useRef<HTMLSpanElement>(null);
    const ClickedOnMenuRef = useRef(false);

    const [openState, setOpenState] = useState(_open);
    const [render, setRender] = useState(false);

    const openMenu = useCallback(() => {
        setOpenState(true);
    }, []);
    const closeMenu = useCallback(() => {
        setOpenState(false);
    }, []);
    const toggleMenu = useCallback(() => {
        setOpenState((prev) => !prev);
    }, []);
    const onDocumentBodyClick = useCallback(
        (evt: MouseEvent) => {
            if (!ClickedOnMenuRef.current) closeMenu();
            ClickedOnMenuRef.current = false;
        },
        [closeMenu]
    );

    const onMenuClick = useCallback<MouseEventHandler<HTMLMenuElement>>(
        (evt) => {
            ClickedOnMenuRef.current = true;
            evt.stopPropagation();
        },
        []
    );
    const onMenuTransitionEnd = useCallback<
        TransitionEventHandler<HTMLElement>
    >((evt) => {
        if (getComputedStyle(evt.currentTarget).opacity === "0") {
            setRender(false);
        }
    }, []);
    const onMenuAnimationEnd = useCallback<AnimationEventHandler<HTMLElement>>(
        (evt) => {
            if (getComputedStyle(evt.currentTarget).opacity === "0") {
                setRender(false);
            }
        },
        []
    );

    const repositionMenu = useCallback(() => {
        if (!MenuRef.current) return;
        if (!AnchorRef.current) return;
        const position = {
            top: "auto",
            right: "auto",
            bottom: "auto",
            left: "auto",
        };
        const bodyRect = document.body.getBoundingClientRect();
        const rect = AnchorRef.current.getBoundingClientRect();
        switch (anchorPoint) {
            case "topLeft": {
                position.top = `${rect.top}px`;
                position.left = `${rect.left}px`;
                break;
            }
            case "topRight": {
                position.top = `${rect.top}px`;
                position.right = `${bodyRect.right - rect.right}px`;
                break;
            }
            case "bottomLeft": {
                position.top = `${rect.top + rect.height}px`;
                position.left = `${rect.left}px`;
                break;
            }
            case "bottomRight": {
                position.top = `${rect.top + rect.height}px`;
                position.right = `${bodyRect.right - rect.right}px`;
                break;
            }
            default: {
            }
        }
        for (const [p, v] of Object.entries(position)) {
            MenuRef.current.style.setProperty(
                `--position-${p}`,
                typeof v === "number" ? `${v}px` : v
            );
        }
    }, [anchorPoint]);

    useWindow(
        (force?: boolean) => {
            repositionMenu();
        },
        {
            resize: true,
            scroll: true,
        }
    );

    // 响应外部传入的显示/隐藏状态
    useEffect(() => {
        setOpenState(_open);
    }, [_open]);

    // 当要显示菜单时，设置渲染状态为 `true`
    // 当要隐藏菜单时，触发 `onClose` 事件
    // 注：此时不会设置渲染状态为 `false`，这个状态根据 `<Menu />` 的动画状态判断
    useEffect(() => {
        _setOpenState?.(openState);
        if (openState) {
            if (AnchorProbeRef.current)
                AnchorRef.current = AnchorProbeRef.current.parentElement;
            setRender(true);
        } else {
            onClose?.();
        }
    }, [openState, _setOpenState, onClose]);

    // 当要显示菜单时，挂载全局的 `onclick` 事件：点击页面任意区域时，隐藏菜单
    // 当要隐藏菜单时，卸载这个事件函数
    useEffect(() => {
        if (openState) {
            document.body.addEventListener("click", onDocumentBodyClick);
        } else {
            document.body.removeEventListener("click", onDocumentBodyClick);
        }
    }, [openState, onDocumentBodyClick]);

    // 触发渲染时，重新定位菜单位置
    useEffect(() => {
        if (render) repositionMenu();
    }, [render, repositionMenu]);

    return globalThis.window ? (
        <>
            {openState && (
                <span
                    className={styles["menu-anchor-probe"]}
                    ref={AnchorProbeRef}
                />
            )}
            {render &&
                createPortal(
                    <menu
                        className={classNames([
                            styles["menu"],
                            {
                                [styles["mod-fading-out"]]: !openState,
                            },
                        ])}
                        onClick={onMenuClick}
                        onTransitionEnd={onMenuTransitionEnd}
                        onAnimationEnd={onMenuAnimationEnd}
                        ref={MenuRef}
                    >
                        {children ?? <>AAA</>}
                    </menu>,
                    document.body
                )}
        </>
    ) : null;
};

export default memo(Menu);

// ============================================================================

export const MenuTitleItem: FC<HTMLAttributes<HTMLHeadingElement>> = ({
    children,
}) => {
    return (
        <h3
            className={classNames([
                styles["menu-item"],
                styles["menu-title-item"],
            ])}
        >
            {children}
        </h3>
    );
};
