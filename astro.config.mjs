// @ts-check
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import node from "@astrojs/node";
import { visualizer } from "rollup-plugin-visualizer";

import "dotenv/config";

// ============================================================================

// 验证必要的环境变量
for (const key of ["SANITY_PROJECT_ID", "SANITY_DATASET"]) {
    // 如果该环境变量不存在，先确认以 `_FILE` 为后缀的变量是否存在
    // Docker Swarm 以这种方式注入 Secret 密文
    if (!process.env[`${key}`]) {
        process.env[`${key}`] =
            process.env[`${key.toLowerCase()}`] ||
            (!!process.env[`${key}_FILE`] &&
            fs.existsSync(process.env[`${key}_FILE`] || "")
                ? fs.readFileSync(process.env[`${key}_FILE`] || "", "utf-8")
                : "");
    }
    // 如果该环境变量仍不存在，抛出错误
    if (!process.env[`${key}`]) throw new Error(`请确认存在环境变量 "${key}"`);
}

// ============================================================================

const { FLYDBH_BUILD_MODE } = process.env;
const isDev = process.env.NODE_ENV === "development";
/** 模式：分析打包文件尺寸 */
const isAnalyze = FLYDBH_BUILD_MODE === "analyze";

// ============================================================================

// https://astro.build/config
export default defineConfig({
    integrations: [react()],
    adapter: node({
        mode: "standalone",
    }),

    output: "server",
    server: ({ command }) => ({ port: command === "dev" ? 8088 : 8080 }),
    // @ts-ignore
    site: "https://fly-dbh.com",

    // 多语言设置
    // i18n: {},

    // Vite 打包工具相关设置
    // Asotro 框架默认使用 Vite 进行打包
    vite: {
        plugins: [
            isAnalyze
                ? visualizer({
                      emitFile: true,
                      filename: "stats.html",
                      gzipSize: true,
                      brotliSize: true,
                  })
                : undefined,
        ],
    },
});
