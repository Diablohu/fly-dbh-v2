import { useEffect, type FC } from "react";

const AnnouncementsHeightCheck: FC<{
    count: number;
}> = ({ count }) => {
    useEffect(() => {
        document.body.style.setProperty(
            "--global-announcement-count",
            `${count}`
        );
    }, [count]);
    return null;
};

export default AnnouncementsHeightCheck;
