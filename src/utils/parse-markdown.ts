import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";
import { htmlAttributeImageViewer } from "@/global";

// ============================================================================

function parseMarkdown(src: string) {
    if (!src) return src;
    return DOMPurify.sanitize(
        marked
            .use({
                renderer: {
                    image(token) {
                        // 为 `.png` 格式的图片强制使用 WebP 格式以节省流量
                        const url = new URL(
                            token.href,
                            /$.+:\/\//.test(token.href)
                                ? undefined
                                : "https://fly-dbh.com"
                        );
                        // const m =
                        //     /[-]*(?<width>\d*)[x]*(?<height>\d*)[\.]*(?<ext>\w+)$/.exec(
                        //         url.pathname
                        //     );
                        // const aspectRatio =
                        //     m?.groups?.width && m?.groups?.height
                        //         ? Number(m.groups.width) /
                        //           Number(m.groups.height)
                        //         : null;
                        if (
                            /\.png$/.test(url.pathname) &&
                            url.searchParams.get("auto") === "format"
                        ) {
                            url.searchParams.delete("auto");
                            url.searchParams.set("fm", "webp");
                            url.searchParams.set("q", "80");
                        }
                        // console.log(token, url.pathname + url.search);
                        // console.log(token.href, url);
                        return `<img src="${url.href}" alt="${token.text}" loading="lazy" ${htmlAttributeImageViewer} />`;
                    },
                },
            })
            .parse(src.replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/, ""), {
                async: false,
                breaks: true,
                gfm: true,
            })
    );
}

export default parseMarkdown;
