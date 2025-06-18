import dayjs from "dayjs";

/**
 * 获取日期字符串
 * - 精确到 `日`
 * - 如果该时间是当前的 **未来**: `刚刚`
 * - 如果该时间距离当前 **不超过 10 分钟**: `刚刚`
 * - 如果该时间距离当前 **不超过 1 小时**: `N 分钟前`
 * - 如果该时间距离当前 **不超过 1 天**: `N 小时前`
 * - 如果该时间距离当前 **不超过 2 天**: `昨天`
 * - 如果该时间和当前 **同一年**: `M 月 D 日`
 * - 其他: `YYYY 年 M 月 D 日`
 */
const getDateString = (date: Date) => {
    const now = new Date();
    const diff = now.valueOf() - date.valueOf();

    // 10 分钟
    if (diff <= 10 * 60_000) return "刚刚";

    // 60 分钟 / 1 小时
    if (diff <= 60 * 60_000) return Math.floor(diff / 60_000) + " 分钟前";

    // 24 小时 / 1 天
    if (diff <= 24 * 60 * 60_000)
        return Math.floor(diff / (60 * 60_000)) + " 小时前";

    // 48 小时 / 2 天
    if (diff <= 2 * 24 * 60 * 60_000) return "昨天";

    const d = dayjs(date);
    if (now.getFullYear() === date.getFullYear()) return d.format("M 月 D 日");
    return d.format("YYYY 年 M 月 D 日");
};

export default getDateString;
