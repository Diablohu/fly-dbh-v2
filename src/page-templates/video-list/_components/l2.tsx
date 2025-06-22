import { useState, useEffect, type FC } from "react";
import { actions } from "astro:actions";
import { type VideoListPageTypesType } from "@/types";

import VideoItem from "@/components/video-item";

import getVideoItemTopTag from "@/utils/get-video-item-top-tag";

// ============================================================================

const List: FC<{
    type?: VideoListPageTypesType;
    slug?: string;
    isIndex: boolean;
    length: number;
    initialList: Exclude<
        Awaited<ReturnType<typeof actions.videoListPageFetch>>["data"],
        undefined
    >["list"];
}> = ({ type, slug, isIndex, length, initialList }) => {
    const [currIndex, setCurrIndex] = useState(initialList?.length || 0);
    const [isComplete, setIsComplete] = useState(!initialList?.length);

    useEffect(() => {
        actions
            .videoListPageFetch({
                type,
                slug,
                from: currIndex,
                length,
            })
            .then((res) => {
                console.log(res.data);
            });
    }, [type, slug, currIndex, length]);

    return <div></div>;
};

export default List;
