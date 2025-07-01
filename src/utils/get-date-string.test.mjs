import { expect, test } from "vitest";
import dayjs from "dayjs";
import getDateString from "./get-date-string";

[
    [
        "如果该时间是当前的 **未来**: `刚刚`",
        [
            dayjs().add(1, "second").toDate(),
            dayjs().add(1, "minute").toDate(),
            dayjs().add(1, "hour").toDate(),
            dayjs().add(1, "day").toDate(),
        ],
        "刚刚",
    ],
    [
        "如果该时间距离当前 **不超过 10 分钟**: `刚刚`",
        [
            dayjs().subtract(1, "second").toDate(),
            dayjs().subtract(1, "minute").toDate(),
            dayjs().subtract(5, "minute").toDate(),
            dayjs().subtract(9, "minute").toDate(),
            dayjs().subtract(9.9999, "minute").toDate(),
        ],
        "刚刚",
    ],
    [
        "如果该时间距离当前 **不超过 1 小时**: `N 分钟前`",
        [
            dayjs().subtract(10, "minute").toDate(),
            dayjs().subtract(20, "minute").toDate(),
            dayjs().subtract(30, "minute").toDate(),
            dayjs().subtract(45, "minute").toDate(),
            dayjs().subtract(59.9999, "minute").toDate(),
        ],
        /^\d* 分钟前$/,
    ],
    [
        "如果该时间距离当前 **不超过 1 天**: `N 小时前`",
        [
            dayjs().subtract(60, "minute").toDate(),
            dayjs().subtract(1.5, "hour").toDate(),
            dayjs().subtract(12, "hour").toDate(),
            dayjs().subtract(20, "hour").toDate(),
            dayjs().subtract(23.9999, "hour").toDate(),
        ],
        /^\d* 小时前$/,
    ],
    [
        "如果该时间距离当前 **不超过 2 天**: `昨天`",
        [
            dayjs().subtract(24, "hour").toDate(),
            dayjs().subtract(30, "hour").toDate(),
            dayjs().subtract(40, "hour").toDate(),
            dayjs().subtract(45, "hour").toDate(),
            dayjs().subtract(47.9999, "hour").toDate(),
        ],
        /^昨天$/,
    ],
    [
        "如果该时间和当前 **同一年**: `M 月 D 日`",
        [dayjs().startOf("year").toDate()],
        /^\d+ 月 \d+ 日$/,
    ],
    [
        "其他: `YYYY 年 M 月`",
        [dayjs().subtract(1, "year").toDate()],
        /^\d{4} 年 \d+ 月$/,
    ],
].forEach(([name, dates, result]) => {
    test(name, () => {
        dates.forEach((d) => {
            expect(getDateString(d)).toMatch(result);
        });
    });
});

/**
 * 获取日期字符串
 * - 精确到 `日`
 * - 如果该时间是当前的 **未来**: `刚刚`
 * - 如果该时间距离当前 **不超过 10 分钟**: `刚刚`
 * - 如果该时间距离当前 **不超过 1 小时**: `N 分钟前`
 * - 如果该时间距离当前 **不超过 1 天**: `N 小时前`
 * - 如果该时间距离当前 **不超过 2 天**: `昨天`
 * - 如果该时间和当前 **同一年**: `M 月 D 日`
 * - 其他: `YYYY 年 M 月`
 */
// const getDateString = (date: Date) => {
//     const now = new Date();
//     const diff = now.valueOf() - date.valueOf();

//     // 10 分钟
//     if (diff <= 10 * 60_000) return "刚刚";

//     // 60 分钟 / 1 小时
//     if (diff <= 60 * 60_000) return Math.floor(diff / 60_000) + " 分钟前";

//     // 24 小时 / 1 天
//     if (diff <= 24 * 60 * 60_000)
//         return Math.floor(diff / (60 * 60_000)) + " 小时前";

//     // 48 小时 / 2 天
//     if (diff <= 2 * 24 * 60 * 60_000) return "昨天";

//     const d = dayjs(date);
//     if (now.getFullYear() === date.getFullYear()) return d.format("M 月 D 日");
//     return d.format("YYYY 年 M 月");
// };

// export default getDateString;
