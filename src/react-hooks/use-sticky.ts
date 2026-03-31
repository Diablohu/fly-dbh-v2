// TODO: https://caniuse.com/?search=scroll-state

import { useEffect, useRef, useState, type RefObject } from "react";

const useSticky = (
    opt:
        | {
              ProbeRef: RefObject<HTMLElement | null>;
          }
        | {
              ContainerRef: RefObject<HTMLElement | null>;
              cssVariableNameExtraTop?: string;
          },
) => {
    const ProbeRef = useRef<HTMLElement>(null);
    const ProbeObserverRef = useRef<IntersectionObserver>(null);
    const [isSticky, setSticky] = useState(false);

    useEffect(() => {
        // 如果没有提供 `ProbeRef`，新建一个元素作为探测目标
        if (
            !("ProbeRef" in opt) &&
            "ContainerRef" in opt &&
            !ProbeRef.current
        ) {
            ProbeRef.current = document.createElement("em");
            ProbeRef.current.style.position = "absolute";
            ProbeRef.current.style.zIndex = "-100";
            ProbeRef.current.style.top = `calc(-2px - var(--global-sticky-top)${
                opt.cssVariableNameExtraTop
                    ? ` - var(${opt.cssVariableNameExtraTop})`
                    : ""
            })`;
            ProbeRef.current.style.left = "0";
            ProbeRef.current.style.width = "0";
            ProbeRef.current.style.height = "0";
            ProbeRef.current.setAttribute("aria-hidden", "true");
            ProbeRef.current.setAttribute("data-role", "sticky-probe");
            opt.ContainerRef.current?.appendChild(ProbeRef.current);
        }

        const probeElement =
            "ProbeRef" in opt ? opt.ProbeRef.current : ProbeRef.current;

        if (!ProbeObserverRef.current)
            ProbeObserverRef.current = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            console.log(entry, "inview");
                            setSticky(false);
                        } else {
                            console.log(entry, "not inview");
                            setSticky(true);
                        }
                    });
                },
                { threshold: 0 },
            );

        if (probeElement) ProbeObserverRef.current?.observe(probeElement);

        return () => {
            if (ProbeObserverRef.current && probeElement) {
                ProbeObserverRef.current.unobserve(probeElement);
            }
            ProbeObserverRef.current?.disconnect();
        };
    }, []);

    return { isSticky };
};

export default useSticky;
