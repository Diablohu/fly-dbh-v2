// @ts-check
import fs from "node:fs";
import path from "node:path";
import "dotenv/config";
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import node from "@astrojs/node";
import { visualizer } from "rollup-plugin-visualizer";

import sanity from "@sanity/astro";

// ============================================================================

// 验证 `.env` 文件是否存在
if (!fs.existsSync(path.resolve("./.env")))
    throw new Error("请确认项目根目录下存在 `.env` 文件");

// ============================================================================

const { FLYDBH_BUILD_MODE } = process.env;
const isDev = process.env.NODE_ENV === "development";
/** 模式：分析打包文件尺寸 */
const isAnalyze = FLYDBH_BUILD_MODE === "analyze";

// ============================================================================

// https://astro.build/config
export default defineConfig({
    integrations: [
        react(),
        sanity({
            projectId: process.env.SANITY_PROJECT_ID,
            dataset: process.env.SANITY_DATASET,
            // useCdn: false, // for static builds
            useCdn: true,
        }),
    ],
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
