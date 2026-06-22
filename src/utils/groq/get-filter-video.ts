/**
 * 获取 GROQ Filter: 视频条目
 *  - 自动过滤未达发布时间 `release` 的条目
 *  - 注意：需要在 Projection 中包含 `release` 字段，否则无法正确过滤
 */
function getFilterVideo(
    filterString: string,
    opt: { noBracket?: boolean } = {},
) {
    filterString = filterString.trim();
    if (filterString && !/^\&\&/.test(filterString))
        filterString = ` && ${filterString}`;

    return `${
        opt.noBracket ? "" : "*["
    }_type == "video" && dateTime(release) < dateTime(now())${filterString}${
        opt.noBracket ? "" : "]"
    }`;
}

export default getFilterVideo;
