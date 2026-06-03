import { actions } from "astro:actions";
import {
    useCallback,
    useState,
    useRef,
    useEffect,
    memo,
    type FC,
    type HTMLAttributes,
} from "react";
import classNames from "classnames";

import { type VideoListPageTypesType } from "@/types";

import { videoListPageCategories as debug } from "@/utils/log";
import getVideoListPageLink from "@/utils/get-video-list-page-link";
import getVideoCategoryInfoFromRawTypeData, {
    type CategoryInfoType,
} from "@/utils/get-video-category-info-from-raw-type-data";

import Menu, { MenuBlockItem } from "@/components/menu";

import styles from "./explore.module.less";

// ============================================================================

type StatusType = "ready" | "loading" | "complete" | "error";

// ============================================================================

const Explore: FC<
    Pick<HTMLAttributes<HTMLSpanElement>, "children"> & {
        type: VideoListPageTypesType;
        title: string;
        listType?: VideoListPageTypesType;
        listSlug?: string;
    }
> = ({ children, type, title, listType, listSlug }) => {
    const StatusRef = useRef<StatusType>("ready");
    const AnimateTickingRef = useRef(false);
    const AnimateRequestTick = useRef(() => {
        if (!AnimateTickingRef.current) {
            requestAnimationFrame(AnimateRequestTick.current);
        }
        AnimateTickingRef.current = true;
    });
    // const SelectRef = useRef<HTMLSelectElement>(null);

    const [status, setStatus] = useState<StatusType>(StatusRef.current);
    const [list, setList] = useState<
        (CategoryInfoType & {
            isActive?: boolean;
        })[]
    >([]);
    const [showMenu, setShowMenu] = useState(false);

    // const toggleMenu = useCallback(
    //     (evt: MouseEvent | Parameters<MouseEventHandler<HTMLElement>>[0]) => {
    //         evt.stopPropagation();
    //         setShowMenu((prev) => !prev);
    //     },
    //     []
    // );

    const onClick = useCallback(() => {
        if (["complete"].includes(StatusRef.current)) {
            setShowMenu(true);
            return;
        }
        if (["loading", "complete"].includes(StatusRef.current)) return;

        setStatus("loading");

        actions.videoListPage
            .fetchTags({
                type: type === "tag" ? "tagSubCategory" : type,
            })
            .then((res) => {
                setStatus("complete");
                debug(`Fetched info for "${type}" %O`, res);
                if (!res || !res.data || !Array.isArray(res.data)) {
                    throw res;
                } else if (res.data.length < 1) {
                    debug(`No data received`);
                } else {
                    const list = res.data
                        .map((item) =>
                            type === "tag"
                                ? {
                                      name: item.title,
                                      route: getVideoListPageLink(
                                          type,
                                          item.slug,
                                      ),
                                      isActive:
                                          listType === type &&
                                          listSlug === item.slug,
                                  }
                                : {
                                      ...getVideoCategoryInfoFromRawTypeData(
                                          type,
                                          item,
                                      ),
                                      isActive:
                                          listType === type &&
                                          listSlug === item.slug,
                                  },
                        )
                        .filter(Boolean);
                    setList(list as CategoryInfoType[]);
                    debug(`Received valid list. Showing sub-menu... %O`, list);
                    // SelectRef.current?.click();
                    setShowMenu(true);
                }
            })
            .catch((err) => {
                setStatus("complete");
                console.trace(err);
            });
    }, [type, listType, listSlug]);

    const onMenuOpen = useCallback<
        Exclude<Parameters<typeof Menu>[0]["onOpen"], undefined>
    >((elMenu) => {
        console.log({ elMenu }, styles["is-active"]);
        elMenu.querySelector(`.${styles["is-active"]}`)?.scrollIntoView({
            block: "center",
        });
    }, []);

    // 同步 `StatusRef` 和 _State_ `status`
    useEffect(() => {
        StatusRef.current = status;
    }, [status]);

    return (
        <span
            onClick={onClick}
            className={classNames([
                styles["explore-interactive"],
                styles[`is-status-${status}`],
                {
                    "is-menu-open": showMenu,
                },
            ])}
        >
            {children}
            <span className={styles["spacing"]}>
                {/* <select ref={SelectRef}>
                    {list.map((item) => (
                        <option value={item.route} key={item.route}>
                            {item.prefix ? `${item.prefix} / ` : ""}
                            {item.name}
                            {item.suffix ? ` (${item.suffix})` : ""}
                        </option>
                    ))}
                </select> */}
                <span className={styles["mask"]} />
                <Menu
                    open={showMenu}
                    setOpenState={setShowMenu}
                    anchorPoint="bottomRight"
                    grow={["up", "right"]}
                    onOpen={onMenuOpen}
                    stickyTitle={title}
                    activeItemScrollIntoView
                >
                    {list.map((item) => (
                        <MenuBlockItem
                            key={item.route}
                            className={styles["menu-link-wrapper"]}
                            isActive={item.isActive}
                        >
                            <a
                                href={item.route}
                                className={styles["menu-link"]}
                            >
                                {item.prefix ? (
                                    <small className={styles["prefix"]}>
                                        {item.prefix}
                                    </small>
                                ) : (
                                    ""
                                )}
                                {item.name}
                                {item.suffix ? ` (${item.suffix})` : ""}
                            </a>
                        </MenuBlockItem>
                    ))}
                </Menu>
            </span>
        </span>
    );
};

export default memo(Explore);
