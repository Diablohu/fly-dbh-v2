import path from "node:path";
import fs from "fs-extra";
import { glob } from "glob";
import less from "less";
import pc from "picocolors";
import { type ResolvedConfig, type Plugin, normalizePath } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { getViteStaticCopyDestBase } from "./helpers";

const pathname = ".cache-assets/styles";

// ============================================================================
// #region Shared Functions

async function buildStart(resolvedConfig: ResolvedConfig): Promise<void> {
    const result = [];
    const standAloneLessFiles = await glob("./src/styles/_stand-alone/*.less", {
        cwd: resolvedConfig.envDir || "",
    });
    for (const lessFilePath of standAloneLessFiles) {
        const file = path.resolve(resolvedConfig.envDir || "", lessFilePath);
        // const outDir = path.resolve(resolvedConfig.build.outDir, "styles");
        const outDir = path.resolve(resolvedConfig.envDir || "", pathname);
        const dest = path.resolve(
            outDir,
            path.basename(lessFilePath, ".less") + ".css",
        );

        const input = await fs.readFile(file, "utf-8");
        const { css } = await less.render(input);
        await fs.ensureDir(outDir);
        await fs.writeFile(dest, css, {
            encoding: "utf-8",
        });

        result.push({
            origin: lessFilePath,
            dest: dest,
        });
    }

    if (result.length > 0) {
        resolvedConfig.logger.info(
            [
                pc.cyan("[vite-plugin-fly-dbh-build]"),
                pc.green(`Compiled ${result.length} stand-alone less file(s).`),
            ].join(" "),
        );
    }
}

// #endregion
// ============================================================================

// ============================================================================
// #region Plugins

const servePlugin = (): Plugin => {
    let config: ResolvedConfig;
    return {
        name: "vite-plugin-fly-dbh-build-stand-alone-less-files:serve",
        enforce: "pre",
        apply: "serve",
        configResolved(_config) {
            config = _config;
        },
        async buildStart() {
            await buildStart(config);
        },
    };
};

const buildPlugin = (): Plugin => {
    let config: ResolvedConfig;
    return {
        name: "vite-plugin-fly-dbh-build-stand-alone-less-files:build",
        enforce: "pre",
        apply: "build",
        configResolved(_config) {
            config = _config;
        },
        async buildStart() {
            await buildStart(config);
        },
    };
};

// #endregion
// ============================================================================

export default () => [
    servePlugin(),
    buildPlugin(),
    viteStaticCopy({
        targets: [
            {
                src: normalizePath(path.resolve(pathname)),
                dest: getViteStaticCopyDestBase() + "",
                rename: {
                    stripBase: 1,
                },
            },
        ],
        // environment: "ssr",
    }),
];
