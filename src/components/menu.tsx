import {
    useState,
    useCallback,
    useEffect,
    useEffectEvent,
    useRef,
    memo,
    type FC,
    type MenuHTMLAttributes,
    type HTMLAttributes,
    type MouseEventHandler,
    type TransitionEventHandler,
    type AnimationEventHandler,
    type ChangeEventHandler,
    type Dispatch,
    type SetStateAction,
    type ReactNode,
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
        onOpen?: (elMenu: HTMLMenuElement) => unknown;
        onClose?: () => unknown;
        anchorPoint?: "topLeft" | "topRight" | "bottomRight" | "bottomLeft";
        grow?: Array<"up" | "down" | "left" | "right" | "nowrap">;
        /**
         * 菜单的标题，会以 `sticky` 方式渲染，固定在菜单顶部，层级在所有菜单元素之上
         */
        stickyTitle?: ReactNode;
        /**
         * 是否在打开菜单时将 `[aria-current="true"]` 的菜单项滚动到可视区域
         */
        activeItemScrollIntoView?: boolean;
    } & Pick<MenuHTMLAttributes<HTMLMenuElement>, "children" | "className">
> = ({
    open: _open = false,
    setOpenState: _setOpenState,
    onOpen,
    onClose,
    anchorPoint = "topLeft",
    grow = [],
    stickyTitle,
    activeItemScrollIntoView = false,
    children,
    className,
}) => {
    /**
     * 菜单容器元素 Ref
     * - 以 `createPortal` 方式渲染到 `document.body`
     */
    const MenuRef = useRef<HTMLMenuElement>(null);
    /**
     * 交互锚点元素 Ref
     * - 菜单会根据这个元素的位置进行对齐
     * - 实际为 `AnchorProbeRef` 的父元素
     */
    const AnchorRef = useRef<HTMLElement>(null);
    const AnchorProbeRef = useRef<HTMLSpanElement>(null);
    /**
     * 是否在菜单内部进行了点击操作的 Flag
     * - 用于判断点击事件是否发生在菜单内部，如果是，不进行隐藏菜单
     */
    const ClickInsideMenuRef = useRef(false);
    const LastRenderRef = useRef(false);
    const AnchorPointRef = useRef(anchorPoint);
    const GrowRef = useRef(grow);

    const [openState, setOpenState] = useState(_open);
    const [render, setRender] = useState(LastRenderRef.current);

    // const openMenu = useCallback(() => {
    //     setOpenState(true);
    // }, []);
    const closeMenu = useCallback(() => {
        setOpenState(false);
    }, []);
    // const toggleMenu = useCallback(() => {
    //     setOpenState((prev) => !prev);
    // }, []);
    const onDocumentBodyClick = useCallback(
        (evt: MouseEvent) => {
            if (
                ClickInsideMenuRef.current ||
                (MenuRef.current &&
                    evt.target instanceof Element &&
                    MenuRef.current.contains(evt.target))
            ) {
                ClickInsideMenuRef.current = false;
                return;
            }

            closeMenu();
        },
        [closeMenu],
    );

    const onMenuClick = useCallback<MouseEventHandler<HTMLMenuElement>>(
        (evt) => {
            ClickInsideMenuRef.current = true;
            evt.stopPropagation();
            setTimeout(() => {
                ClickInsideMenuRef.current = false;
            });
        },
        [],
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
        [],
    );

    const onMenuOpen = useEffectEvent(() => {
        if (!MenuRef.current) return;
        onOpen?.(MenuRef.current);
        MenuRef.current.querySelector(`[aria-current="true"]`)?.scrollIntoView({
            block: "center",
        });
    });

    const repositionMenu = useCallback(() => {
        if (!MenuRef.current) return;
        if (!AnchorRef.current) return;

        const position = {
            top: "",
            right: "",
            bottom: "",
            left: "",
        };

        // 如果菜单设置了 `nowrap`，每次都重置
        if (GrowRef.current.includes("nowrap")) {
            for (const [p, v] of Object.entries(position)) {
                MenuRef.current.style.setProperty(
                    `--position-${p}`,
                    typeof v === "number" ? `${v}px` : v,
                );
            }
        }

        const bodyRect = document.body.getBoundingClientRect();
        const rect = AnchorRef.current.getBoundingClientRect();
        switch (AnchorPointRef.current) {
            case "topLeft": {
                position.top = `${rect.top}px`;
                position.left = `${rect.left}px`;
                break;
            }
            case "topRight": {
                if (GrowRef.current.includes("up"))
                    position.top = `${rect.top - MenuRef.current.offsetHeight}px`;
                else position.top = `${rect.top}px`;

                if (GrowRef.current.includes("right"))
                    position.left = `${rect.left + rect.width}px`;
                else position.right = `${bodyRect.right - rect.right}px`;

                break;
            }
            case "bottomLeft": {
                position.top = `${rect.top + rect.height}px`;
                if (
                    GrowRef.current.includes("nowrap") &&
                    rect.left + MenuRef.current.offsetWidth > window.innerWidth
                )
                    position.left = `${window.innerWidth - MenuRef.current.offsetWidth}px`;
                else position.left = `${rect.left}px`;
                break;
            }
            case "bottomRight": {
                if (GrowRef.current.includes("up"))
                    position.bottom = `max(var(--menu-safe-edge), ${
                        window.innerHeight - rect.top - rect.height
                    }px)`;
                else position.top = `${rect.top + rect.height}px`;

                if (GrowRef.current.includes("right"))
                    position.left = `${rect.left + rect.width}px`;
                else position.right = `${bodyRect.right - rect.right}px`;

                break;
            }
            default: {
            }
        }
        for (const [p, v] of Object.entries(position)) {
            MenuRef.current.style.setProperty(
                `--position-${p}`,
                typeof v === "number" ? `${v}px` : v,
            );
        }
    }, []);

    useWindow(repositionMenu, {
        resize: true,
        scroll: true,
    });

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

    // 触发渲染时
    // 1. 重新定位菜单位置
    // 2. 触发 `onOpen`
    useEffect(() => {
        if (render && LastRenderRef.current !== render) {
            repositionMenu();
            onMenuOpen();
        }
        LastRenderRef.current = render;
    }, [render, repositionMenu]);

    useEffect(() => {
        AnchorPointRef.current = anchorPoint;
        GrowRef.current = grow;
    }, [anchorPoint, grow]);

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
                            className,
                            {
                                [styles["mod-fading-out"]]: !openState,
                                [styles["is-grou-up"]]: grow.includes("up"),
                            },
                        ])}
                        onClick={onMenuClick}
                        onTransitionEnd={onMenuTransitionEnd}
                        onAnimationEnd={onMenuAnimationEnd}
                        ref={MenuRef}
                    >
                        {typeof stickyTitle !== "undefined" && (
                            <MenuTitleItem sticky>{stickyTitle}</MenuTitleItem>
                        )}
                        {children}
                    </menu>,
                    document.body,
                )}
        </>
    ) : null;
};

export default memo(Menu);

// ============================================================================

export const MenuItem: FC<HTMLAttributes<HTMLDivElement>> = memo(
    ({ className, ...props }) => {
        return (
            <section
                className={classNames([styles["menu-item"], className])}
                {...props}
            />
        );
    },
);

export const MenuBlockItem: FC<
    { isActive?: boolean } & HTMLAttributes<HTMLDivElement>
> = memo(({ className, isActive = false, ...props }) => {
    return (
        <MenuItem
            className={classNames([
                styles["menu-block-item"],
                className,
                {
                    [styles["is-active"]]: isActive,
                },
            ])}
            aria-current={isActive ? true : undefined}
            {...props}
        />
    );
});

export const MenuTitleItem: FC<
    HTMLAttributes<HTMLHeadingElement> & {
        sticky?: boolean;
    }
> = memo(({ className, children, sticky = false }) => {
    return (
        <h5
            className={classNames([
                styles["menu-item"],
                styles["menu-title-item"],
                className,
                {
                    [styles["mod-sticky"]]: sticky,
                },
            ])}
        >
            {children}
        </h5>
    );
});

export const MenuLineItem: FC = memo(() => {
    return <hr className={styles["menu-line-item"]} />;
});

export const MenuSwitchItem: FC<
    Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & {
        label?: string;
        checked?: boolean;
        defaultChecked?: boolean;
        onChange?: (checked: boolean) => unknown;
    }
> = memo(({ className, label, checked, defaultChecked, onChange }) => {
    const onCheckboxChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
        (evt) => {
            onChange?.(evt.currentTarget.checked === true);
        },
        [onChange],
    );
    const onLabelClick = useCallback<MouseEventHandler<HTMLLabelElement>>(
        (evt) => {
            evt.stopPropagation();
        },
        [],
    );
    return (
        <MenuItem
            className={classNames([styles["menu-switch-item"], className])}
        >
            <label onClick={onLabelClick}>
                <input
                    type="checkbox"
                    defaultChecked={defaultChecked}
                    checked={checked}
                    onChange={onCheckboxChange}
                />
                {label}
                <span className={classNames([styles["switch"]])} />
            </label>
        </MenuItem>
    );
});
