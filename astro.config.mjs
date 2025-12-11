// @ts-check
import path from "node:path";
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import node from "@astrojs/node";
import { normalizePath } from "vite";
import { visualizer } from "rollup-plugin-visualizer";
import { viteStaticCopy } from "vite-plugin-static-copy";
import compileStandAloneLessFilesPlugin from "./config/vite-plugins/compile-stand-alone-less-files";

import "dotenv/config";

// ============================================================================

const { FLYDBH_BUILD_MODE } = process.env;
const isDev = process.env.NODE_ENV === "development";
/** 模式：分析打包文件尺寸 */
const isAnalyze = FLYDBH_BUILD_MODE === "analyze";
/** 模式：next.fly-dbh.com */
const isNext = FLYDBH_BUILD_MODE === "next";

// #region Astro Config
// https://astro.build/config
export default defineConfig({
    integrations: [react()],
    adapter: node({
        mode: "standalone",
    }),

    output: "server",
    server: ({ command }) => ({ port: command === "dev" ? 8088 : 8080 }),
    // @ts-ignore
    site: isNext ? "https://next.fly-dbh.com" : "https://fly-dbh.com",

    // 多语言设置
    // i18n: {},

    // 客户端设置
    prefetch: {
        defaultStrategy: "tap",
    },

    // 服务器设置
    trailingSlash: "never",

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
            viteStaticCopy({
                targets: [
                    {
                        src: normalizePath(
                            path.resolve("node_modules/viewerjs/dist/**/*")
                        ),
                        dest: "libs/viewerjs",
                    },
                ],
            }),
            compileStandAloneLessFilesPlugin(),
        ],
    },

    experimental: {
        fonts: [
            {
                provider: "local",
                name: "Helvetica Compressed",
                cssVariable: "--font-helvetica-compressed",
                fallbacks: ["sans-serif"],
                variants: [
                    {
                        src: ["./src/assets/fonts/Helvetica-Compressed.otf"],
                    },
                ],
            },
        ],
    },
});
// #endregion Astro Config
