import { urlPrefixSanityImageCdn } from "@/global";
import { imageBuilder } from "./sanity-image";

export const transformImagePath = (pathname: string) =>
    `${urlPrefixSanityImageCdn}${pathname.replace(
        `images/${process.env.SANITY_PROJECT_ID}/${process.env.SANITY_DATASET}`,
        "",
    )}`;

export const stringReplaceImagePath = (str: string) =>
    str.replace(
        new RegExp(
            `(\\"|\\()(https://cdn.sanity.io/)*images/${process.env.SANITY_PROJECT_ID}/${process.env.SANITY_DATASET}/`,
            "gm",
        ),
        `$1${urlPrefixSanityImageCdn}/`,
    );

export const generateLocalImagePath = (filename: string) => {
    filename = filename.replace(/^\//, "");
    return `${urlPrefixSanityImageCdn}/${filename}`;
};

/**
 * `->path` 或 `->url` 是一次 resolve 操作，性能较低，建议使用 `_ref` 进行二次处理。
 * 参见: https://www.sanity.io/docs/developer-guides/high-performance-groq#k59a0d6dbea9f
 *
 * 该函数会根据传入的 asset 类型生成本地图片路径
 */
export const resolveAssetPath = (asset: { _ref: string } | string) => {
    if (typeof asset === "string") return transformImagePath(asset);
    // TODO:
    // console.log(imageBuilder.image(asset).url())
    return transformImagePath(imageBuilder.image(asset).url());
};
