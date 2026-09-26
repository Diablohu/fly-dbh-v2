import { type ImageFormat, type FitMode } from "@sanity/image-url";
import { urlBase, urlPrefixSanityImageCdn } from "@/global";

// ============================================================================

interface Options {
    format?: "auto" | ImageFormat;
    quality?: number | string;
    width?: number | string;
    height?: number | string;
    blur?: number | string;
    fit?: FitMode;
}
interface FullOptions extends Options {
    fm?: Options["format"];
    q?: Options["quality"];
    w?: Options["width"];
    h?: Options["height"];
}

// ============================================================================

function floorNumberToString(input: number | string) {
    return typeof input === "number"
        ? Math.floor(input) + ""
        : Math.floor(Number(input)) + "";
}

function getUrl(
    _filename: string | URL,
    options: FullOptions = {},
    removeAttributes: (keyof FullOptions)[] = [],
    settings?: {
        /** 如果传入，无论为何值，本函数内将不再检查传入的 `filename` 是否为 URL */
        filenameIsValidUrl?: boolean;
    },
) {
    let url;
    let isFilenameUrl = false;
    const filename = _filename instanceof URL ? _filename.href : _filename;

    /**
     * 仅使用改 URL 变量操作 URL Search
     * - 由于不同环境 URL 前缀不同，输出最终结果时，再拼装
     */
    if (settings?.filenameIsValidUrl === true) {
        url = _filename instanceof URL ? _filename : new URL(filename);
        isFilenameUrl = true;
    } else if (settings?.filenameIsValidUrl === false) {
        url = new URL(`${urlPrefixSanityImageCdn}/${filename}`, urlBase);
    } else {
        try {
            url = new URL(filename);
            isFilenameUrl = true;
        } catch (e) {
            url = new URL(`${urlPrefixSanityImageCdn}/${filename}`, urlBase);
        }
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

    function parseParam(
        checkParams: (keyof FullOptions)[],
        key?: string,
        valueIsString?: boolean,
    ) {
        if (!key) key = checkParams[0];
        checkParams.forEach((p) => {
            if (options[p])
                params.set(
                    key,
                    valueIsString && typeof options[p] === "string"
                        ? options[p]
                        : floorNumberToString(options[p]),
                );
            if (removeAttributes.includes(p)) params.delete(key);
        });
    }

    parseParam(["q", "quality"]);
    parseParam(["w", "width"]);
    parseParam(["h", "height"]);
    parseParam(["blur"]);
    parseParam(["fit"], undefined, true);

    return `${
        // 如果 `filanme` 是 URL，或以 `/` 为前缀，不添加前缀
        isFilenameUrl || /^\//.test(filename)
            ? ""
            : urlPrefixSanityImageCdn + "/"
    }${filename.split("?")[0]}${url.search}`;
}

export default getUrl;
