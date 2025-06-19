import { useEffect, useCallback, useRef } from "react";

const useWindowResizeScroll = (func: (force?: boolean) => void) => {
    const AnimateTickingRef = useRef(false);
    const AnimateRequestTick = useRef(() => {
        if (!AnimateTickingRef.current) {
            requestAnimationFrame(AnimateRequestTick.current);
        }
        AnimateTickingRef.current = true;
    });

    const setStylesFunction = useCallback((force?: boolean) => {
        // reset the tick so we can
        // capture the next onScroll
        AnimateTickingRef.current = false;
        func(force);
    }, []);

    const setStyles = useCallback(() => {
        if (!AnimateTickingRef.current) {
            requestAnimationFrame(() => setStylesFunction());
        }
        AnimateTickingRef.current = true;
    }, [setStylesFunction]);

    useEffect(() => {
        setStylesFunction(true);
        window.addEventListener("resize", setStyles);
        window.addEventListener("scroll", setStyles);
        return () => {
            window.removeEventListener("resize", setStyles);
            window.removeEventListener("scroll", setStyles);
        };
    }, [setStylesFunction, setStyles]);
};

export default useWindowResizeScroll;
