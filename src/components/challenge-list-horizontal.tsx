import { memo, type ComponentProps, type FC } from "react";
import { type ChallengeListItemType } from "@/types";

import ChallengeItem from "@/components/challenge-item";

import ListContainerHorizontal, {
    classNameItem,
} from "@/components/list-container-horizontal";

// ============================================================================

const VideoListHorizontal: FC<
    {
        challenges: ChallengeListItemType[];
        showMore?: boolean;
    } & Pick<
        ComponentProps<typeof ChallengeItem>,
        "showMaxCategory" | "showAircraftTypes"
    >
> = ({
    challenges,
    showMore,
    showMaxCategory = false,
    showAircraftTypes = false,
}) => (
    <ListContainerHorizontal showMore={showMore}>
        {challenges.map((v) => (
            <ChallengeItem
                key={v._id}
                className={classNameItem}
                item={v}
                showMaxCategory={showMaxCategory}
                showAircraftTypes={showAircraftTypes}
            />
        ))}
    </ListContainerHorizontal>
);

export default memo(VideoListHorizontal);
