import { useEffect, useCallback, useMemo, useRef } from "react";

const useWindow = (
    func: (force?: boolean) => unknown,
    options: {
        resize?: boolean;
        scroll?: boolean;
    }
) => {
    const AnimateTickingRef = useRef(false);
    const AnimateRequestTick = useRef(() => {
        if (!AnimateTickingRef.current) {
            requestAnimationFrame(AnimateRequestTick.current);
        }
        AnimateTickingRef.current = true;
    });
    const WindowResizeObserverRef = useRef<ResizeObserver>(null);

    const listeningOnResize = useMemo(
        () => options?.resize || false,
        [options]
    );
    const listeningOnScroll = useMemo(
        () => options?.scroll || false,
        [options]
    );

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
        if (listeningOnResize) {
            if (window.ResizeObserver) {
                if (!WindowResizeObserverRef.current) {
                    WindowResizeObserverRef.current = new ResizeObserver(() =>
                        setStyles()
                    );
                    WindowResizeObserverRef.current.observe(document.body);
                }
            } else {
                window.addEventListener("resize", setStyles);
            }
        }
        if (listeningOnScroll) window.addEventListener("scroll", setStyles);
        return () => {
            if (listeningOnResize) {
                if (window.ResizeObserver) {
                    WindowResizeObserverRef.current?.unobserve(document.body);
                    WindowResizeObserverRef.current?.disconnect();
                    WindowResizeObserverRef.current = null;
                } else {
                    window.removeEventListener("resize", setStyles);
                }
            }
            if (listeningOnScroll)
                window.removeEventListener("scroll", setStyles);
        };
    }, [listeningOnResize, listeningOnScroll, setStylesFunction, setStyles]);
};

export default useWindow;
