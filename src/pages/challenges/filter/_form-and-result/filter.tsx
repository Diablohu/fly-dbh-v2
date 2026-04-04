import {
    useState,
    useCallback,
    useMemo,
    useRef,
    memo,
    type FC,
    type ChangeEventHandler,
    type MouseEventHandler,
} from "react";
import classNames from "classnames";

import { type ChallengeDifficultyType } from "@/types";

import Menu, { MenuLineItem, MenuBlockItem } from "@/components/menu";
import arrowDown from "@/assets/arrow/down3.svg?raw";

import styles from "./index.module.less";

// ============================================================================
//
// #region React Component
//
// ============================================================================

const Filter: FC<{
    label: string;
    name: "aircraftTypes" | "difficulties" | "hazards";
    options: Array<{
        label: string;
        value: string | number;
        difficulty?: ChallengeDifficultyType;
    }>;
    initialValue?: Array<string | number>;
    multiple?: boolean;
    disabled?: boolean;
}> = ({
    label,
    name,
    options: _options,
    initialValue,
    multiple = false,
    disabled = false,
}) => {
    const OptionsContainerRef = useRef<HTMLDivElement>(null);

    const inputType = useMemo(
        () => (multiple ? "checkbox" : "radio"),
        [multiple],
    );
    const optionIdPrefix = useMemo(() => `__challenge-filter-${name}-`, [name]);
    const optionIdAll = useMemo(() => `${optionIdPrefix}-1`, [optionIdPrefix]);
    const options = useMemo(
        () =>
            _options.map((option, index) => ({
                id: `${optionIdPrefix}${index}`,
                ...option,
            })),
        [_options, optionIdPrefix],
    );
    // console.log({ initialValue, options });

    const [showMenu, setShowMenu] = useState(false);
    const [selectedText, setSelectedText] = useState(
        initialValue
            ?.map((value) => {
                const option = options.find((option) => option.value === value);
                return option ? option.label : "";
            })
            .join(", ") || "全部",
    );

    const onClick = useCallback(() => {
        if (disabled) return;
        setShowMenu((showMenu) => !showMenu);
    }, [disabled]);

    const onInputClick = useCallback<MouseEventHandler<HTMLInputElement>>(
        (evt) => {
            evt.stopPropagation();
        },
        [],
    );
    const onValueChange = useCallback<
        ChangeEventHandler<HTMLInputElement, HTMLInputElement>
    >(
        (evt) => {
            if (inputType === "radio")
                return setSelectedText(() => {
                    const option = options.find(
                        (option) =>
                            option.value.toString() === evt.target.value,
                    );
                    return option ? option.label : "全部";
                });

            const isAllOption = !evt.target.value;

            // 对于 `checkbox` 类型，`全部` 选项被取消选中时，强制保持选中状态
            if (isAllOption && !evt.target.checked) {
                evt.target.checked = true;
                return setSelectedText("全部");
            }

            // 对于 `checkbox` 类型，`全部` 选项被选中时，取消所有非 `全部` 选项的选中状态
            if (isAllOption && evt.target.checked) {
                options.forEach((option) => {
                    const optionInput =
                        OptionsContainerRef.current?.querySelector(
                            `#${option.id}`,
                        ) as HTMLInputElement;
                    if (optionInput) optionInput.checked = false;
                });
                return setSelectedText("全部");
            }

            // 对于 `checkbox` 类型，若有任何一个非 `全部` 选项被选中时，强制取消 `全部` 选项的选中状态
            if (!isAllOption && evt.target.checked) {
                const allOption = OptionsContainerRef.current?.querySelector(
                    `#${optionIdAll}`,
                ) as HTMLInputElement;
                if (allOption) allOption.checked = false;
            }

            // 对于 `checkbox` 类型，若所有非 `全部` 选项被选中时，强制选中 `全部` 选项，所有非 `全部` 选项取消选中状态
            if (
                !isAllOption &&
                evt.target.checked &&
                options.every((option) => {
                    const optionInput =
                        OptionsContainerRef.current?.querySelector(
                            `#${option.id}`,
                        ) as HTMLInputElement;
                    return optionInput ? optionInput.checked : false;
                })
            ) {
                const allOption = OptionsContainerRef.current?.querySelector(
                    `#${optionIdAll}`,
                ) as HTMLInputElement;
                if (allOption) {
                    allOption.checked = true;
                    options.forEach((option) => {
                        const optionInput =
                            OptionsContainerRef.current?.querySelector(
                                `#${option.id}`,
                            ) as HTMLInputElement;
                        if (optionInput) optionInput.checked = false;
                    });
                }
            }

            return setSelectedText(
                OptionsContainerRef.current
                    ? [
                          ...OptionsContainerRef.current?.querySelectorAll(
                              `input[name="${name}"]:checked`,
                          ),
                      ]
                          .map((input) => {
                              const option = options.find(
                                  (option) =>
                                      option.value.toString() ===
                                      input.getAttribute("value"),
                              );
                              return option ? option.label : "";
                          })
                          .join(", ") || "全部"
                    : "全部",
            );
        },
        [name, inputType, options, optionIdAll],
    );

    return (
        <section
            className={classNames([
                styles["filter"],
                {
                    [styles["is-menu-open"]]: showMenu,
                },
            ])}
            onClick={onClick}
        >
            <section className={styles["options"]} ref={OptionsContainerRef}>
                <input
                    id={optionIdAll}
                    type={inputType}
                    name={name}
                    value=""
                    defaultChecked={!initialValue || initialValue.length === 0}
                    onChange={onValueChange}
                    onClick={onInputClick}
                />
                {options.map(({ id, value }) => (
                    <input
                        key={id}
                        id={id}
                        type={inputType}
                        name={name}
                        value={value}
                        defaultChecked={initialValue?.includes(value)}
                        onChange={onValueChange}
                        onClick={onInputClick}
                    />
                ))}
            </section>
            <span
                className={styles["label"]}
                dangerouslySetInnerHTML={{
                    __html: arrowDown + label,
                }}
            ></span>
            <span className={styles["current"]}>
                <strong>{selectedText}</strong>
            </span>
            <Menu
                open={showMenu}
                setOpenState={setShowMenu}
                anchorPoint="bottomLeft"
                grow={["down", "right", "nowrap"]}
                // onOpen={onMenuOpen}
                // stickyTitle={title}
            >
                <MenuBlockItem className={styles["option-in-menu"]}>
                    <label htmlFor={optionIdAll} className={styles["label"]}>
                        <em className={styles["indicator"]} />
                        全部
                    </label>
                </MenuBlockItem>
                <MenuLineItem />
                {options.map(({ id, label, value, difficulty }) => (
                    <MenuBlockItem
                        key={id}
                        className={styles["option-in-menu"]}
                    >
                        <label
                            htmlFor={id}
                            className={styles["label"]}
                            data-difficulty={difficulty}
                            data-value={value}
                            data-name={name}
                        >
                            <em className={styles["indicator"]} />
                            {label}
                        </label>
                    </MenuBlockItem>
                ))}
            </Menu>
        </section>
    );
};

export default memo(Filter);
