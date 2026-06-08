import { useRef, useEffect, useCallback, type FC } from "react";
import { MAIN_BLOCK_WITH_SIDEBAR_SIDE_SWITCH_SMALL_SCREEN } from "@/constants/element-ids";
import updateRootCssVariable from "@/utils/update-root-css-variable";

// ============================================================================

const CategoriesClientInit: FC = () => {
    const ProbeRef = useRef<HTMLSpanElement>(null);
    const SidebarContainerRef = useRef<HTMLDivElement>(null);
    const SidebarResizeObserverRef = useRef<ResizeObserver>(null);

    const AnimateTickingRef = useRef(false);
    const AnimateRequestTick = useRef(() => {
        if (!AnimateTickingRef.current) {
            requestAnimationFrame(AnimateRequestTick.current);
        }
        AnimateTickingRef.current = true;
    });

    const triggerWindowScrollFunction = useCallback(() => {
        // reset the tick so we can
        // capture the next onScroll
        AnimateTickingRef.current = false;
        window.dispatchEvent(new Event("scroll"));
    }, []);

    const triggerWindowScroll = useCallback(() => {
        if (!AnimateTickingRef.current) {
            requestAnimationFrame(() => triggerWindowScrollFunction());
        }
        AnimateTickingRef.current = true;
    }, [triggerWindowScrollFunction]);

    useEffect(() => {
        if (!ProbeRef.current) return;

        let thisLevel: HTMLElement | null | undefined = ProbeRef.current;
        let parent: HTMLElement | null | undefined =
            ProbeRef.current.parentElement;
        let checkbox: HTMLInputElement | null | undefined =
            parent?.querySelector(
                `input#${MAIN_BLOCK_WITH_SIDEBAR_SIDE_SWITCH_SMALL_SCREEN}`,
            );

        if (!parent) return;
        while (!checkbox) {
            thisLevel = parent;
            parent = parent?.parentElement;
            if (parent === document.body) break;

            checkbox = parent?.querySelector(
                `input#${MAIN_BLOCK_WITH_SIDEBAR_SIDE_SWITCH_SMALL_SCREEN}`,
            );
        }

        // 获取侧边栏元素，并监听其尺寸变化以更新全局 CSS 变量
        if (checkbox && !SidebarContainerRef.current) {
            SidebarContainerRef.current =
                checkbox.parentElement as HTMLDivElement;
            if (!SidebarResizeObserverRef.current) {
                SidebarResizeObserverRef.current = new ResizeObserver(
                    (entries) => {
                        entries.forEach((entry) => {
                            if (entry.target === SidebarContainerRef.current) {
                                // console.log(
                                //     "sidebarResizeObserverCallback (ResizeObserver)",
                                //     entry.target.offsetHeight,
                                //     entry.target.clientHeight,
                                // );
                                updateRootCssVariable(
                                    "--rt-global-sidebar-height",
                                    entry.target.clientHeight,
                                );
                            }
                        });
                    },
                );
                SidebarResizeObserverRef.current.observe(
                    SidebarContainerRef.current,
                );
            }
        }

        if (thisLevel) {
            thisLevel.addEventListener("scroll", triggerWindowScroll);
            const activeItem: HTMLElement | null =
                thisLevel.querySelector(".is-active");
            // if (activeItem)
            //     console.log(
            //         activeItem.offsetTop + activeItem.offsetHeight,
            //         thisLevel.offsetHeight
            //     );
            if (
                activeItem &&
                activeItem.offsetTop + activeItem.offsetHeight + 100 >
                    thisLevel.offsetHeight
            ) {
                thisLevel.scrollTo({
                    top: activeItem.offsetTop / 2,
                    behavior: "smooth",
                });
            }
        }

        return () => {
            if (thisLevel)
                thisLevel.removeEventListener("scroll", triggerWindowScroll);
            if (SidebarResizeObserverRef.current) {
                SidebarResizeObserverRef.current.disconnect();
                SidebarResizeObserverRef.current = null;
            }
        };
    }, [triggerWindowScroll]);
    return <span ref={ProbeRef} />;
};

export default CategoriesClientInit;
