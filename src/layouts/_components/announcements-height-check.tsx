import { useEffect, type FC } from "react";

const AnnouncementsHeightCheck: FC<{
    count: number;
}> = ({ count }) => {
    useEffect(() => {
        document.documentElement.style.setProperty(
            "--global-announcement-count",
            `${count}`
        );
    }, [count]);
    return null;
};

export default AnnouncementsHeightCheck;
