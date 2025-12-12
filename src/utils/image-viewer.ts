import { htmlAttributeImageViewer } from "@/global";
import md5 from "md5";
import loadResources from "@/utils/load-resources";

// ============================================================================

const classNameLoading = "is-loading-image-viewer";

// ============================================================================

export function generateHtmlImageViewer({
    containerClass,
    src,
    srcOriginal,
    alt,
    loading = "lazy",
    ...attributes
}: {
    containerClass?: string;
    srcOriginal?: string;
    caption?: string;
} & astroHTML.JSX.ImgHTMLAttributes): string {
    return `<a href="${srcOriginal ?? src}" class="${[
        containerClass,
        "image-viewer-container",
    ].join(" ")}"><img src="${
        src
    }" alt="${alt}" loading="${loading}" ${Object.entries(attributes)
        .map(([key, value]) => `${key}="${value}"`)
        .join(" ")} ${htmlAttributeImageViewer}="${srcOriginal ?? src}" /></a>`;
}

export async function openImageViewer(opener: HTMLElement, src: string) {
    if (!globalThis.window) return;
    opener.classList.add(classNameLoading);
    await loadResources([
        {
            type: "style",
            src: "/libs/viewerjs/viewer.min.css",
            id: "i" + md5("styleTagIdViewerCss"),
            options: { persist: true },
        },
        {
            type: "style",
            src: "/styles/override-viewer.css",
            id: "i" + md5("idStyleOverrideCss"),
            options: { persist: true },
        },
        {
            type: "script",
            src: "/libs/viewerjs/viewer.min.js",
            // id: md5("scriptTagIdViewer"),
            options: {
                checkExist: () => {
                    return typeof window.Viewer !== "undefined";
                },
            },
        },
    ]);
    opener.classList.remove(classNameLoading);

    const viewer = new Viewer(opener, {
        navbar: false,
        url: () => src,
        toolbar: {
            zoomIn: 1,
            zoomOut: 1,
            oneToOne: 1,
            reset: 1,
            prev: false,
            play: false,
            next: false,
            rotateLeft: 1,
            rotateRight: 1,
            flipHorizontal: 1,
            flipVertical: 1,
        },
        hidden: () => {
            viewer.destroy();
        },
    });
    viewer.show();
}
