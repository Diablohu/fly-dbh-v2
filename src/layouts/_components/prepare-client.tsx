import { memo, useEffect, useCallback, type FC } from "react";

import hashHistory from "history/hash";
import browserHistory from "history/browser";

import { type ValidVideoItemShowPlatformLinksOnHoverType } from "@/types";
import { htmlAttributeImageViewer } from "@/global";
import { pointerHovering } from "@/constants/root-classnames";
import { openImageViewer } from "@/utils/image-viewer";

import useWindow from "@/react-hooks/use-window";
import useVideoItemShowPlatformLinksOnHover from "@/react-hooks/use-video-item-show-platform-links-on-hover";

// ============================================================================

function rootOnPointerEnter(evt: PointerEvent) {
    if (evt.pointerType === "mouse" || evt.pointerType === "pen")
        document.documentElement.classList.add(pointerHovering);
    else document.documentElement.classList.remove(pointerHovering);
}
function rootOnPointerLeave(/*evt: PointerEvent*/) {
    document.documentElement.classList.remove(pointerHovering);
}
function bodyDelegateClick(evt: MouseEvent) {
    // 图片查看器
    if (
        evt.target instanceof HTMLAnchorElement &&
        evt.target.classList.contains("image-viewer-container")
    ) {
        const elImg = evt.target.querySelector(`[${htmlAttributeImageViewer}]`);
        if (elImg instanceof HTMLElement) {
            evt.preventDefault();
            openImageViewer(
                elImg,
                elImg.getAttribute(htmlAttributeImageViewer) as string,
            );
            return;
        }
    }
    if (
        evt.target instanceof HTMLElement &&
        typeof evt.target.getAttribute(htmlAttributeImageViewer) === "string"
    ) {
        evt.preventDefault();
        openImageViewer(
            evt.target,
            evt.target.getAttribute(htmlAttributeImageViewer) as string,
        );
        return;
    }

    // 站外链接兜底为新窗口打开
    if (
        evt.target instanceof HTMLAnchorElement &&
        !evt.target.getAttribute("target")
    ) {
        const href = evt.target.getAttribute("href") || "";
        if (href[0] === "/") return;
        if (href[0] === "#") return;
        if (/^(javascript|mailto|tel):/.test(href)) return;
        if (new RegExp(`^${location.origin}`).test(href)) return;
        evt.preventDefault();
        window.open(href, "_blank");
        return;
    }
}

// ============================================================================

/**
 * `仅客户端环境`
 * - 为 `<window>` 挂载 `hashHistory` 和 `browserHistory`
 * - 监听 `<window>` 更改尺寸，实时更新滚动条宽度 CSS 变量 `--body-scrollbar-width`
 * - 监听 `<body>` **Click** 事件，delegate 方式打开图片查看器
 */
const PrepareClient: FC<{
    defaults: {
        videoItemShowPlatformLinksOnHover?: ValidVideoItemShowPlatformLinksOnHoverType;
    };
}> = ({ defaults }) => {
    const [videoItemShowPlatformLinksOnHover] =
        useVideoItemShowPlatformLinksOnHover(
            defaults.videoItemShowPlatformLinksOnHover || "0",
        );

    /** 计算并设置滚动条宽度 */
    const setScrollbarWidth = useCallback(() => {
        document.documentElement.style.setProperty(
            "--body-scrollbar-width",
            // window.innerWidth - document.documentElement.clientWidth + "px"
            // 获取 body 实际宽度，这个数值不包含 body 的 margin
            window.innerWidth - document.body.offsetWidth + "px",
        );
    }, []);
    useWindow(setScrollbarWidth, {
        resize: true,
    });

    useEffect(() => {
        // 挂载 history 对象
        if (!window._browserHistory) window._browserHistory = browserHistory;
        if (!window._hashHistory) window._hashHistory = hashHistory;

        // 设置全局根节点属性
        window._contentRoot = document.querySelector(
            "body > .root",
        ) as HTMLDivElement;

        // 利用 pointer event 判断当前交互是否为 pointer hover
        if (window.PointerEvent) {
            document.documentElement.classList.add(pointerHovering);
            document.documentElement.addEventListener(
                "pointerenter",
                rootOnPointerEnter,
            );
            document.documentElement.addEventListener(
                "pointerleave",
                rootOnPointerLeave,
            );
        } else {
            document.documentElement.classList.add(pointerHovering);
        }

        document.body.addEventListener("click", bodyDelegateClick);

        return () => {
            if (window.PointerEvent) {
                document.documentElement.removeEventListener(
                    "pointerenter",
                    rootOnPointerEnter,
                );
                document.documentElement.addEventListener(
                    "pointerleave",
                    rootOnPointerLeave,
                );
            }
            document.body.removeEventListener("click", bodyDelegateClick);
        };
    }, []);

    // 根据用户选项，在 `<window>` 添加全局 classname
    useEffect(() => {
        if (videoItemShowPlatformLinksOnHover === "1") {
            document.documentElement.classList.add(
                "option-video-item-show-platform-links-on-hover",
            );
        } else {
            document.documentElement.classList.remove(
                "option-video-item-show-platform-links-on-hover",
            );
        }
    }, [videoItemShowPlatformLinksOnHover]);

    return null;
};

export default memo(PrepareClient);
