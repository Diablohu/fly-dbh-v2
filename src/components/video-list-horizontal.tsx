import { memo, type FC } from "react";

import VideoItem, {
    type Props as VideoItemProps,
} from "@/components/video-item";

import ListContainerHorizontal, {
    classNameItem,
} from "@/components/list-container-horizontal";

// ============================================================================

const VideoListHorizontal: FC<{
    videos: VideoItemProps[];
    showMore?: boolean;
    allowAssetPriorityHigh?: boolean;
}> = ({ videos, showMore, allowAssetPriorityHigh = false }) => (
    <ListContainerHorizontal showMore={showMore} isVideoList>
        {videos.map((v, index) => (
            <VideoItem
                key={v._id}
                className={classNameItem}
                assetPriority={
                    allowAssetPriorityHigh && index < 10 ? "high" : undefined
                }
                {...v}
            />
        ))}
    </ListContainerHorizontal>
);

export default memo(VideoListHorizontal);
