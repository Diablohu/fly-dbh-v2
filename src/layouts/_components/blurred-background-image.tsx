import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    useRef,
    type FC,
} from "react";
import classNames from "classnames";
import { urlPrefixSanityImageCdn } from "@/global";
import getSanityImageUrl from "@/utils/get-sanity-image-url";

import styles from "./blurred-background-image.module.less";

// ============================================================================

/**
 * 渲染模糊的背景图
 *  - 需传入 Sanity CMS 图片文件名或 Sanity 图片链接
 */
const BlurredBackgroundImage: FC<{
    sanityImageFilename?: string;
    sanityImageUri?: string;
}> = ({ sanityImageFilename, sanityImageUri }) => {
    const ImageRef = useRef<HTMLImageElement>(null);

    const [state, setState] = useState<"loading" | "loaded" | "error">(
        "loading",
    );

    const imageSrc = useMemo(() => {
        const uri = sanityImageFilename
            ? `${urlPrefixSanityImageCdn}/${sanityImageFilename}`
            : sanityImageUri;
        if (!uri) return "";
        return `${getSanityImageUrl(uri, {
            fm: "auto",
            w: 960,
            q: 60,
            blur: 50,
        })}`;
    }, [sanityImageFilename, sanityImageUri]);

    const onImageLoad = useCallback(() => {
        setState("loaded");
    }, []);

    useEffect(() => {
        if (ImageRef.current?.complete) {
            onImageLoad();
        }
    }, [onImageLoad]);

    if (!imageSrc) return null;
    return (
        <div
            className={classNames([styles["blurred-background-image"]], {
                [styles["is-loading"]]: state === "loading",
            })}
        >
            <img src={imageSrc} onLoad={onImageLoad} ref={ImageRef} />
        </div>
    );
};

export default BlurredBackgroundImage;
