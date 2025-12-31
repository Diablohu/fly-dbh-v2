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
}> = ({ videos, showMore }) => (
    <ListContainerHorizontal showMore={showMore} isVideoList>
        {videos.map((v) => (
            <VideoItem key={v._id} className={classNameItem} {...v} />
        ))}
    </ListContainerHorizontal>
);

export default memo(VideoListHorizontal);
