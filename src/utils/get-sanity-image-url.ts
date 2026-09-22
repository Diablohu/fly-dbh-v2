import { urlBase, urlPrefixSanityImageCdn } from "@/global";

// ============================================================================

interface Options {
    format?: "auto" | "webp";
    quality?: number | string;
    width?: number | string;
    blur?: number | string;
}
interface FullOptions extends Options {
    fm?: Options["format"];
    q?: Options["quality"];
    w?: Options["width"];
}

// ============================================================================

function floorNumberToString(input: number | string) {
    return typeof input === "number"
        ? Math.floor(input) + ""
        : Math.floor(Number(input)) + "";
}

function getUrl(
    filename: string,
    options: FullOptions = {},
    removeAttributes: (keyof FullOptions)[] = [],
) {
    let url;
    let isFilenameUrl = false;

    /**
     * 仅使用改 URL 变量操作 URL Search
     * - 由于不同环境 URL 前缀不同，输出最终结果时，再拼装
     */
    try {
        url = new URL(filename);
        isFilenameUrl = true;
    } catch (e) {
        url = new URL(`${urlPrefixSanityImageCdn}/${filename}`, urlBase);
    }
    const params = url.searchParams;

    if (options.format === "auto" || options.fm === "auto") {
        params.set("auto", "format");
        params.delete("fm");
    } else if (options.format || options.fm) {
        if (options.format) params.set("fm", options.format);
        else if (options.fm) params.set("fm", options.fm);
        params.delete("auto");
    }
    if (
        removeAttributes.includes("format") ||
        removeAttributes.includes("fm")
    ) {
        params.delete("auto");
        params.delete("fm");
    }

    function parseParam(checkParams: (keyof FullOptions)[], key?: string) {
        if (!key) key = checkParams[0];
        checkParams.forEach((p) => {
            if (options[p]) params.set(key, floorNumberToString(options[p]));
            if (removeAttributes.includes(p)) params.delete(key);
        });
    }

    parseParam(["q", "quality"]);
    parseParam(["w", "width"]);
    parseParam(["blur"]);

    return `${
        // 如果 `filanme` 以 `/` 为前缀，判断为 URL，不添加前缀
        /^\//.test(filename)
            ? ""
            : // 如果 `filanme` 是 URL，不添加前缀
              isFilenameUrl
              ? ""
              : urlPrefixSanityImageCdn + "/"
    }${filename.split("?")[0]}${url.search}`;
}

export default getUrl;
