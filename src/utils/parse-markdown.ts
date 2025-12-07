import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

// ============================================================================

function parseMarkdown(src: string) {
    if (!src) return src;
    return DOMPurify.sanitize(
        marked
            .use({
                renderer: {
                    image(token) {
                        const url = new URL(token.href, "https://fly-dbh.com");
                        if (
                            /\.png$/.test(url.pathname) &&
                            url.searchParams.get("auto") === "format"
                        ) {
                            url.searchParams.delete("auto");
                            url.searchParams.set("fm", "webp");
                            url.searchParams.set("q", "80");
                        }
                        // console.log(token, url.pathname + url.search);
                        /*
                        TODO: Image Viewer
                        */
                        return `<img src="${url.pathname + url.search}" alt="${token.text}" />`;
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
