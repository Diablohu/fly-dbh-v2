import axios, { type AxiosRequestConfig, type Method } from "axios";
import { navigate } from "astro:transitions/client";

import toast from "@/utils/toast";

// ============================================================================

export function getApiBase(curentLocale: LocaleType) {
    switch (curentLocale) {
        case "zh": {
            if (import.meta.env.PROD) {
                return "https://aiteaching-api.cmcm.com";
            } else if (import.meta.env.MODE === "test") {
                return "https://test-aiteaching-api.cmcm.com";
            } else if (import.meta.env.DEV) {
                return "https://test-aiteaching-api.cmcm.com";
                // return 'https://aiteaching-api.cmcm.com';
            }
        }
        // 海外版
        default:
            if (import.meta.env.PROD) {
                return "https://test-aiteaching-api.cmcm.com";
            } else if (import.meta.env.MODE === "test") {
                return "https://test-aiteaching-api.cmcm.com";
            } else if (import.meta.env.DEV) {
                return "http://10.60.81.112:8080";
                // return 'https://test-aiteaching-api.cmcm.com';
            }
    }

    return "/";
}

// ============================================================================

export const errors = {
    UNAUTHORIZED: "UNAUTHORIZED",
};

// ============================================================================

/** 发送请求 */
async function request<T = any>(
    currentLocale: LocaleType,
    method: Method,
    url: string,
    /**
     * 请求数据
     * - 自动根据请求方法 `method`，设置为 `params` 或 `data`
     */
    requestData?: any,
    /** _Axios_ 配置对象 */
    config: AxiosRequestConfig = {},
    /** 出错时，是否自动弹出错误 Toast */
    showError = true,
    /**
     * 当出现请求错误时，自定义显示的错误 Toast 信息
     * - 需要 `showError` 为 `true` 时才会显示
     */
    errorMessage = "",
    /** 最大重试次数，默认为 `0` (不重试) */
    maxRetries = 0,
    settings: {
        /** 遇到登录失效相关错误时，是否自动重定向到登录页 */
        autoRedirectUnauthorized?: boolean;
        /** 遇到登录失效相关错误时，是否自动刷新页面 */
        autoRefreshUnauthorized?: boolean;
    } = {}
) {
    let data, params;
    const { autoRedirectUnauthorized = true, autoRefreshUnauthorized = false } =
        settings;

    if (method === "get" || method === "GET") {
        params = requestData;
    } else if (
        method === "post" ||
        method === "put" ||
        method === "delete" ||
        method === "POST" ||
        method === "PUT" ||
        method === "DELETE"
    ) {
        data = requestData;
    }

    const loginToken = getLoginToken();

    const headers = {
        ...config?.headers,
        Authorization: loginToken ? `Bearer ${loginToken}` : "",
    };

    // url不是绝对路径时，拼接baseURL
    if (!url.startsWith("http")) {
        if (!url.startsWith("/")) {
            url = "/" + url;
        }
        url = getApiBase(currentLocale) + url;
    }

    let retryCount = 0;
    let finalErrorMessage = "";

    while (retryCount <= maxRetries) {
        try {
            const requestParams = {
                method: method,
                url: url,
                data,
                params,
                ...config,
                headers,
            };
            const result = await axios<{
                code: number;
                data: T;
                message?: string;
                msg?: string;
                status?: number;
            }>(requestParams);

            if (
                result?.data?.code == 20000 ||
                result?.data?.code == 0 ||
                result?.data?.code == 200 ||
                result?.data?.status == 200
            ) {
                return Promise.resolve(result.data.data);
            }

            // 对于401/403错误不进行重试
            if (result?.data?.code === 401 || result?.data?.code === 403) {
                resetLoginUserInfo();
                if (autoRedirectUnauthorized) navigate("/login");
                if (autoRefreshUnauthorized) {
                    setTimeout(() => window.location.reload());
                }
                if (globalThis.window && showError)
                    toast.error(
                        window.__LocaleStringsGlobal__[
                            "toast-request-unauthorized"
                        ] /*.replace(/\n/gm, "<br />")*/
                    );
                return Promise.reject(errors.UNAUTHORIZED);
            }

            finalErrorMessage =
                result?.data?.message || result?.data?.msg || "";
            if (showError) toast.error(finalErrorMessage);
            return Promise.reject(finalErrorMessage);
        } catch (err: any) {
            finalErrorMessage = err.message;

            // 如果还有重试次数，继续重试
            if (retryCount < maxRetries) {
                retryCount++;
                // 可以添加延迟重试，避免立即重试
                await new Promise((resolve) =>
                    setTimeout(resolve, 500 * retryCount)
                );
                continue;
            }
            break;
        }
    }

    if (
        globalThis.window &&
        showError !== false &&
        (errorMessage || finalErrorMessage)
    ) {
        toast.error(
            window.__LocaleStringsGlobal__["toast-request-failed"].replace(
                "**",
                errorMessage || finalErrorMessage
            )
        );
        return Promise.reject(finalErrorMessage);
    }
}

export default request;
