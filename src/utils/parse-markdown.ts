import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

// ============================================================================

function parseMarkdown(src: string) {
    if (!src) return src;
    return DOMPurify.sanitize(
        marked.parse(
            src.replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/, ""),
            { async: false, breaks: true, gfm: true }
        )
    );
}

export default parseMarkdown;

/*
TODO: Image Viewer
*/
