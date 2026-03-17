// @ts-check
import path from "node:path";
import { defineConfig, fontProviders } from "astro/config";
import react from "@astrojs/react";
import node from "@astrojs/node";
import sitemap from "@astrojs/sitemap";
import { normalizePath } from "vite";
import { visualizer } from "rollup-plugin-visualizer";
import { viteStaticCopy } from "vite-plugin-static-copy";
import compileStandAloneLessFilesPlugin from "./config/vite-plugins/compile-stand-alone-less-files";

import "dotenv/config";

import { domain, hostnameNext } from "./vars.mjs";

// ============================================================================

const { FLYDBH_BUILD_MODE } = process.env;
const isDev = process.env.NODE_ENV === "development";
/** 模式：分析打包文件尺寸 */
const isAnalyze = FLYDBH_BUILD_MODE === "analyze";
/** 模式：next.fly-dbh.com */
const isNext = FLYDBH_BUILD_MODE === "next";
const site = isDev
    ? "http://localhost:8088"
    : isNext
      ? `https://${hostnameNext}`
      : `https://${domain}`;

// #region Astro Config
// https://astro.build/config
export default defineConfig({
    integrations: [
        react(),
        sitemap({
            filter: (page) =>
                new RegExp(
                    `^${site}($|/)((?!(${[
                        "admin",
                        "api",
                        "homepage",
                        "live", // TODO: unlock
                        "tools", // TODO: unlock
                        "challenges-wip", // TODO: remove
                    ].join("|")})($|/)).)*$`,
                ).test(page),
            customSitemaps: [
                `${site}/sitemap-videos.xml`,
                `${site}/sitemap-challenges.xml`,
            ],
        }),
    ],
    adapter: node({
        mode: "standalone",
    }),

    site,

    // #region 字体
    fonts: [
        {
            provider: fontProviders.local(),
            name: "Helvetica Compressed",
            cssVariable: "--font-helvetica-compressed",
            fallbacks: ["sans-serif"],
            options: {
                variants: [
                    {
                        src: ["./src/assets/fonts/Helvetica-Compressed.otf"],
                    },
                ],
            },
        },
    ],

    // #region 多语言
    // i18n: {},

    // #region 客户端
    prefetch: {
        defaultStrategy: "tap",
    },

    // #region 服务器
    output: "server",
    server: ({ command }) => ({
        port: command === "dev" ? 8088 : 8080,
    }),
    trailingSlash: "never",
    security: {
        checkOrigin: false,
        allowedDomains: [
            {
                hostname: `**.${domain}`,
                protocol: "https",
            },
            // {
            //     hostname: `0.0.0.0`,
            // },
        ],
    },

    // #region 开发环境
    devToolbar: {
        enabled: false,
    },

    // #region Vite
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
                            path.resolve("node_modules/viewerjs/dist/**/*"),
                        ),
                        dest: "libs/viewerjs",
                    },
                ],
            }),
            compileStandAloneLessFilesPlugin(),
        ],
        // TODO: remove this code after Astro fix following issue
        // https://github.com/withastro/astro/issues/15520
        optimizeDeps: { exclude: ["astro/virtual-modules/prefetch.js"] },
    },

    // #region 试验选项
    experimental: {},
});
// #endregion Astro Config
