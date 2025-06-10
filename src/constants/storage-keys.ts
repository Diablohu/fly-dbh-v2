/**
 * @module
 * `localStorage` 或 `sessionStorage` 的公用 Key
 */

/** 登录 Token */
export const loginToken = "token";
/**
 * 登录过期时间戳
 * - 为了确保嵌入的页面不会出现登录界面，主站的登录过期时间设置的比较短
 */
export const loginExpiryTimestamp = "tokenExpiry";
/** 当前登录的用户信息 */
export const userInfo = "userInfo";
