export const getSearchPageTitle = (keyword?: string) =>
    `搜索${keyword ? `: ${keyword}` : ""}`;
