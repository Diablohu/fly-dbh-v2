import { title as siteTitle } from "@/global";

/** 获取页面完整标题 */
function getPageTitle(title: string) {
    return title === siteTitle ? title : `${title} | FLY-DBH.com`;
}

export default getPageTitle;
