import { useRef, useEffect, useCallback, type FC } from "react";
import { VIDEO_LIST_PAGE_CATEGORY_SWITCH_SMALL_SCREEN } from "@/constants/element-ids";

// ============================================================================

const CategoriesClientInit: FC = () => {
    const ProbeRef = useRef<HTMLSpanElement>(null);
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
                `input#${VIDEO_LIST_PAGE_CATEGORY_SWITCH_SMALL_SCREEN}`
            );

        if (!parent) return;
        while (!checkbox) {
            thisLevel = parent;
            parent = parent?.parentElement;
            if (parent === document.body) break;

            checkbox = parent?.querySelector(
                `input#${VIDEO_LIST_PAGE_CATEGORY_SWITCH_SMALL_SCREEN}`
            );
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
                thisLevel.scrollTop = activeItem.offsetTop / 2;
            }
        }

        return () => {
            if (thisLevel)
                thisLevel.removeEventListener("scroll", triggerWindowScroll);
        };
    }, [triggerWindowScroll]);
    return <span ref={ProbeRef} />;
};

export default CategoriesClientInit;
