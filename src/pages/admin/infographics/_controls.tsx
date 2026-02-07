import { useCallback, useState, Fragment, type FC } from "react";
import classNames from "classnames";

import { generateLocalImagePath } from "@/services/sanity-helpers";
// import updateRootCssVariable from "@/utils/update-root-css-variable";

import useViewType from "./_use-view-type";
import TagButton from "@/components/tag-button";

import styles from "./_controls.module.less";

// ============================================================================

const backgroundImages = [
    "/25750b52129d205e8676d772a27ac1c52d12102b-2560x1440.png",
    "/d914a8255869df1c524558a08c6a27b781a0770c-2560x1440.jpg",
];

// ============================================================================

const Divider = () => <em className={styles.divider} />;

// ============================================================================

const InfographicsControls: FC = () => {
    const [backgroundImageFilename, setBackgroundImageFilename] =
        useState<string>(backgroundImages[0]);
    const [viewType, setViewType] = useViewType();

    const onClick = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            const t = e.currentTarget.getAttribute("data-view-type");
            if (t) {
                setViewType(t as typeof viewType);
            }
        },
        [setViewType],
    );
    const onBackgroundChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            setBackgroundImageFilename(e.currentTarget.value);
        },
        [],
    );

    // useEffect(() => {
    //     updateRootCssVariable("--theme-color", "#000");
    //     return () => {
    //         updateRootCssVariable("--theme-color", false);
    //     };
    // }, []);

    return (
        <>
            <section
                className={classNames([
                    styles.controls,
                    {
                        [styles[`is-view-${viewType}`]]: true,
                    },
                ])}
            >
                {[
                    "default",
                    "output",
                    "mask",
                    "backdrop-mask",
                    "watermark",
                ].map((t) => (
                    <Fragment key={t}>
                        <TagButton
                            data-view-type={t}
                            onClick={onClick}
                            className={classNames([
                                styles.button,
                                { [styles["is-active"]]: t === viewType },
                            ])}
                        >
                            {t.toUpperCase()}
                        </TagButton>
                        {t === "default" ? <Divider /> : null}
                    </Fragment>
                ))}
                <Divider />
                <label className={styles["background-selector"]}>
                    <span className={styles.label}>Background</span>
                    <select
                        defaultValue={backgroundImageFilename}
                        name="background"
                        onChange={onBackgroundChange}
                    >
                        {backgroundImages.map((filename) => (
                            <option key={filename} value={filename}>
                                {filename}
                            </option>
                        ))}
                    </select>
                    <em className={styles["select-box"]} />
                </label>
            </section>
            <section
                className={classNames([
                    styles["background"],
                    {
                        [styles[`is-view-${viewType}`]]: true,
                    },
                ])}
                style={{
                    backgroundImage: `url(${generateLocalImagePath(
                        backgroundImageFilename,
                    )}?auto=format)`,
                }}
            ></section>
            {viewType === "watermark" && (
                <section className={styles["watermark-overlay"]} />
            )}
        </>
    );
};

export default InfographicsControls;
