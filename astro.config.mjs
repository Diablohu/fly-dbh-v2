// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import node from "@astrojs/node";
import { visualizer } from "rollup-plugin-visualizer";

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
    site: 'fly-dbh.com',

    // 多语言设置
    i18n: false,

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
