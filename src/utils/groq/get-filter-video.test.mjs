import { expect, test } from "vitest";
import getFilterVideo from "./get-filter-video";

[
    [
        "空字符串",
        [""],
        `*[_type == "video" && dateTime(release) < dateTime(now())]`,
    ],
    [
        "false 型",
        ["0"],
        `*[_type == "video" && dateTime(release) < dateTime(now()) && 0]`,
    ],
    [
        "开头有 &&",
        ["&& AAA", " && AAA", "&& AAA ", " && AAA "],
        `*[_type == "video" && dateTime(release) < dateTime(now()) && AAA]`,
    ],
    [
        "开头没有 &&",
        ["AAA", " AAA", "AAA ", " AAA "],
        `*[_type == "video" && dateTime(release) < dateTime(now()) && AAA]`,
    ],
].forEach(([name, dates, result]) => {
    test(name, () => {
        dates.forEach((d) => {
            expect(getFilterVideo(d)).toMatch(result);
        });
    });
});
