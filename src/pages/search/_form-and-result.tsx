import {
    useState,
    useCallback,
    useEffect,
    type FC,
    type FormEventHandler,
} from "react";
import { actions } from "astro:actions";

import { type ValidContentListAutoLoadMoreType } from "@/types";

import getAircraftFamilyName from "@/utils/get-aircraft-family-name";
import { search as logSearch } from "@/utils/log";

import VideoListGrid from "@/components/video-list-grid";

// ============================================================================

type StatusType = "pending" | "ready" | "loading" | "error";
const searchAction = actions.search.query;

// ============================================================================

const SearchFormAndResult: FC<{
    initialKeyword: string;
    initialResults?: Awaited<ReturnType<typeof searchAction>>["data"];
    defaultContentListAutoLoadMore: ValidContentListAutoLoadMoreType;
}> = ({ initialKeyword, initialResults, defaultContentListAutoLoadMore }) => {
    const [status, setStatus] = useState<StatusType>("pending");
    const [error, setError] = useState<string>();
    const [keyword, setKeyword] = useState<string>("");
    const [results, setResults] =
        useState<Awaited<ReturnType<typeof searchAction>>["data"]>();

    const onSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
        async (evt) => {
            evt.preventDefault();

            if (status === "pending") return;
            if (status === "loading") return;
            setKeyword(
                new FormData(evt.currentTarget).get("keyword") as string
            );
        },
        [status]
    );

    useEffect(() => {
        if (!keyword) return;
        // const action = evt.currentTarget.getAttribute("action");
        // const method = evt.currentTarget.getAttribute("method");
        // if (!action) return;
        // if (!method) return;

        window.history.replaceState(null, "", `/search/${keyword}`);

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
        setStatus("ready");
    }, []);

    return (
        <>
            <form method="GET" onSubmit={onSubmit}>
                <input
                    type="text"
                    name="keyword"
                    defaultValue={initialKeyword}
                    autoComplete="off"
                    required
                />
                <input
                    type="submit"
                    value="GO"
                    disabled={status === "loading"}
                />
            </form>
            {status === "error" && <div>{error}</div>}
            {(!!results || !!initialResults) && status !== "loading" && (
                <Results
                    keyword={keyword}
                    results={results || initialResults}
                    defaultContentListAutoLoadMore={
                        defaultContentListAutoLoadMore
                    }
                />
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
    return (
        <>
            {Array.isArray(results?.aircraftFamilies) &&
                results?.aircraftFamilies.length > 0 && (
                    <dl>
                        <dt>机型</dt>
                        <dd>
                            {results.aircraftFamilies.map((item) => (
                                <p key={item._id}>
                                    <a
                                        key={item._id}
                                        href={`/videos/aircraftfamily-${item.slug}`}
                                    >
                                        {getAircraftFamilyName(
                                            item.name,
                                            item.maker.name_zh_cn ||
                                                item.maker.name ||
                                                ""
                                        )}
                                    </a>
                                </p>
                            ))}
                        </dd>
                    </dl>
                )}
            {Array.isArray(results?.videos) && results?.videos.length > 0 && (
                <dl>
                    <dt>视频</dt>
                    <dd>
                        <VideoListGrid
                            type="search"
                            slug={keyword}
                            initialList={results.videos}
                            infiniteScroll
                            initialListIsComplete={
                                results.videos.length >= results.videosTotal
                            }
                            defaultContentListAutoLoadMore={
                                defaultContentListAutoLoadMore
                            }
                            showLoadMoreButton
                            tagPurpose="search-result"
                        />
                    </dd>
                </dl>
            )}
        </>
    );
};
