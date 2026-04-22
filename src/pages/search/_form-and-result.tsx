import {
    useState,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    Fragment,
    type FC,
    type SubmitEventHandler,
} from "react";
import { actions } from "astro:actions";
import classNames from "classnames";

import { routeBase } from "@/global";
import { type ValidContentListAutoLoadMoreType } from "@/types";

import { search as logSearch } from "@/utils/log";

import VideoListGrid from "@/components/video-list-grid";
import ChallengeListGrid from "@/components/challenge-list-grid";
import TagButton from "@/components/tag-button";
import iconSearch from "@/assets/svg-symbols/search.svg?raw";

import { getSearchPageTitle } from "./_helpers";
import getPageTitle from "@/utils/get-page-title";

import styles from "./_form-and-result.module.less";

// ============================================================================

type StatusType = "pending" | "ready" | "loading" | "error";
const searchAction = actions.search.query;

// ============================================================================

const SearchFormAndResult: FC<{
    initialKeyword: string;
    initialResults?: Awaited<ReturnType<typeof searchAction>>["data"];
    defaultContentListAutoLoadMore: ValidContentListAutoLoadMoreType;
}> = ({ initialKeyword, initialResults, defaultContentListAutoLoadMore }) => {
    const InputRef = useRef<HTMLInputElement>(null);

    const [status, setStatus] = useState<StatusType>("pending");
    const [error, setError] = useState<string>();
    const [keyword, setKeyword] = useState<string>();
    const [results, setResults] =
        useState<Awaited<ReturnType<typeof searchAction>>["data"]>();

    const onSubmit = useCallback<SubmitEventHandler<HTMLFormElement>>(
        async (evt) => {
            evt.preventDefault();

            if (status === "pending") return;
            if (status === "loading") return;
            setKeyword(
                new FormData(evt.currentTarget).get("keyword") as string,
            );
        },
        [status],
    );

    useEffect(() => {
        // console.log(123, keyword)
        if (!keyword) return;
        // const action = evt.currentTarget.getAttribute("action");
        // const method = evt.currentTarget.getAttribute("method");
        // if (!action) return;
        // if (!method) return;

        window.history.replaceState(
            window.history.state,
            "",
            `${routeBase.search}/${keyword}`,
        );
        document.title = getPageTitle(getSearchPageTitle(keyword));

        setError("");
        setStatus("loading");
        // const res = await fetch(action, {
        //     method: method.toUpperCase(),
        //     body: new FormData(evt.currentTarget),
        // });
        searchAction({
            keyword,
        }).then(({ data, error }) => {
            // if (res.status !== 200) {
            //     setStatus("error");
            //     setError(`Error: ${res.status} ${res.statusText}`);
            //     return;
            // }
            if (!data || error) {
                setStatus("error");
                setError(`${error?.status} ${error?.code}`);
                return;
            }

            logSearch("Fetched results %O", data);
            setResults(data);
            setStatus("ready");
        });
    }, [keyword]);

    useEffect(() => {
        if (InputRef.current) InputRef.current.focus();
        setStatus("ready");
    }, []);

    useEffect(() => {
        if (status === "ready" && InputRef.current) InputRef.current.focus();
    }, [status]);

    return (
        <>
            <form className={styles["form"]} method="GET" onSubmit={onSubmit}>
                <input
                    ref={InputRef}
                    type="search"
                    name="keyword"
                    defaultValue={initialKeyword}
                    autoComplete="off"
                    placeholder="请输入关键字..."
                    required
                    autoFocus
                />
                <button
                    type="submit"
                    disabled={status === "loading"}
                    dangerouslySetInnerHTML={{
                        __html: iconSearch,
                    }}
                />
            </form>
            {status === "error" && <div>{error}</div>}
            {(!!results || !!initialResults) && status !== "loading" && (
                <Results
                    keyword={keyword ?? initialKeyword}
                    results={results || initialResults}
                    defaultContentListAutoLoadMore={
                        defaultContentListAutoLoadMore
                    }
                />
            )}
            {status === "loading" && (
                <span className={styles["loading-spinner"]} />
            )}
        </>
    );
};
export default SearchFormAndResult;

// ============================================================================

const Results: FC<{
    keyword: string;
    results: Awaited<ReturnType<typeof searchAction>>["data"];
    defaultContentListAutoLoadMore: ValidContentListAutoLoadMoreType;
}> = ({ keyword, results, defaultContentListAutoLoadMore }) => {
    const isMatchedAircraftOrDevice = useMemo(
        () => results && "tutorialsForMatchedAircraftOrDevice" in results,
        [results],
    );
    const totalResultCount = useMemo(
        () =>
            (results?.total || 0) + (results?.approachChallenges?.length || 0),
        [results],
    );

    return (
        <>
            {!!isMatchedAircraftOrDevice &&
                results?.tutorialsForMatchedAircraftOrDevice?.list && (
                    <dl
                        className={classNames([
                            styles["list"],
                            styles["isMatchedAircraftOrDevice-list"],
                        ])}
                    >
                        <dt>
                            <small>您是否在寻找</small>
                            <h2>
                                <a
                                    href={`/videos/aircraftfamily-${
                                        results
                                            ?.tutorialsForMatchedAircraftOrDevice
                                            .slug
                                    }`}
                                >
                                    {
                                        results
                                            ?.tutorialsForMatchedAircraftOrDevice
                                            .maker
                                    }{" "}
                                    {
                                        results
                                            ?.tutorialsForMatchedAircraftOrDevice
                                            .name
                                    }
                                </a>
                            </h2>
                        </dt>
                        <dd>
                            {Object.entries(
                                results?.tutorialsForMatchedAircraftOrDevice
                                    ?.list,
                            )
                                .filter(
                                    ([_, list]) =>
                                        Array.isArray(list) && list.length > 0,
                                )
                                .map(([type, list]) => (
                                    <Fragment key={type}>
                                        <h4>{type}</h4>
                                        <VideoListGrid
                                            type="aircraftFamily"
                                            initialList={list}
                                            initialListIsComplete
                                            showLoadMoreButton={false}
                                            allowAssetPriorityHigh
                                        />
                                    </Fragment>
                                ))}
                        </dd>
                    </dl>
                )}
            {!isMatchedAircraftOrDevice &&
                Array.isArray(results?.aircraftFamilies) &&
                results?.aircraftFamilies.length > 0 && (
                    <dl
                        className={classNames([
                            styles["list"],
                            styles["related-list"],
                        ])}
                    >
                        <dt>
                            <h3>相关机型系列</h3>
                        </dt>
                        <dd>
                            {results.aircraftFamilies.map((item) => (
                                <TagButton
                                    key={item._id}
                                    href={`/videos/aircraftfamily-${item.slug}`}
                                    prefix={item.maker}
                                >
                                    {item.name}
                                </TagButton>
                            ))}
                        </dd>
                    </dl>
                )}
            {!isMatchedAircraftOrDevice &&
                Array.isArray(results?.aircraftOnboardDevices) &&
                results?.aircraftOnboardDevices.length > 0 && (
                    <dl
                        className={classNames([
                            styles["list"],
                            styles["related-list"],
                        ])}
                    >
                        <dt>
                            <h3>相关机载设备</h3>
                        </dt>
                        <dd>
                            {results.aircraftOnboardDevices.map((item) => (
                                <TagButton
                                    key={item._id}
                                    href={`/videos/aircraftonboarddevice-${item.slug}`}
                                    prefix={item.maker}
                                >
                                    {item.name}
                                </TagButton>
                            ))}
                        </dd>
                    </dl>
                )}
            {
                // 固定翼着陆挑战内容
                Array.isArray(results?.approachChallenges) &&
                    results?.approachChallenges.length > 0 && (
                        <dl
                            className={classNames([
                                styles["list"],
                                styles["video-list"],
                            ])}
                        >
                            <dt>
                                <h3>相关固定翼飞机挑战</h3>
                            </dt>
                            <dd>
                                <ChallengeListGrid
                                    catalog="filter"
                                    showAircraftTypes
                                    initialList={results.approachChallenges}
                                    infiniteScroll={false}
                                    initialListIsComplete
                                    showCompleteText={false}
                                />
                            </dd>
                        </dl>
                    )
            }
            {
                // 视频内容
                Array.isArray(results?.list) && results?.list.length > 0 && (
                    <dl
                        className={classNames([
                            styles["list"],
                            styles["video-list"],
                        ])}
                    >
                        <dt>
                            <h3>
                                {isMatchedAircraftOrDevice && "其他"}
                                相关视频内容
                            </h3>
                        </dt>
                        <dd>
                            <VideoListGrid
                                type="search"
                                slug={keyword}
                                initialList={results.list}
                                infiniteScroll
                                initialListIsComplete={
                                    results.list.length >= results.total
                                }
                                defaultContentListAutoLoadMore={
                                    defaultContentListAutoLoadMore
                                }
                                showLoadMoreButton
                                tagPurpose="search-result"
                                allowAssetPriorityHigh
                            />
                        </dd>
                    </dl>
                )
            }
            {totalResultCount === 0 && (
                <div className={styles["no-result"]}>
                    <strong>查询无结果</strong>
                    <p>请尝试其他关键字</p>
                </div>
            )}
        </>
    );
};
