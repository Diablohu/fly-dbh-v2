import { execSync, spawn, spawnSync } from "node:child_process";
import dayjs from "dayjs";
import { select, Separator } from "@inquirer/prompts";
import { startVitest } from "vitest/node";
import chalk from "chalk";

// import p from "./package.json" with { type: "json" };

// ============================================================================

function logSuccess(t, msg) {
    console.error(
        ["✅ ", chalk.bgGreen.bold(` ${t} `), chalk.green.bold(` ${msg}`)].join(
            "",
        ),
    );
}
function logError(t, error) {
    if (!(error instanceof Error)) error = new Error(error);
    console.error(
        [
            "🚫 ",
            chalk.bgRed.bold(` ${t} `),
            chalk.red.bold(` ${error.message}`),
        ].join(""),
    );
    if (error.cause) console.log(chalk.gray.italic(`   ${error.cause}`));
}
async function npmRun(cmd) {
    return spawn(`npm run ${cmd}`, {
        stdio: "inherit",
        shell: true,
    });
}

// ============================================================================

async function main() {
    const answer = await select({
        message: "请选择一个任务",
        pageSize: 20,
        choices: [
            new Separator(" "),
            new Separator("── 🚧 本地开发 ──────────"),
            {
                name: "开启开发环境",
                short: "\n🚧 开启本地开发环境",
                value: "npm:::dev",
                description: "npm 命令: dev\n",
            },
            {
                name: "开启开发环境 (本地素材服务器)",
                short: "\n🚧 开启本地开发环境 (本地素材服务器)",
                value: "npm:::dev:local-assets-server",
                description: "npm 命令: dev:local-assets-server\n",
            },
            {
                name: "分析打包文件尺寸",
                short: "\n🚧 执行打包，并自动生成分析报告",
                value: "npm:::analyze",
                description: "执行打包，并自动生成分析报告\n",
            },
            {
                name: "更新 NPM 依赖",
                short: "\n🚧 更新 NPM 依赖 Packages",
                value: "npm:::up",
                description: "更新 NPM 依赖 Packages\n",
            },
            {
                name: "开启单元测试",
                short: "\n🚧 开启单元测试 (Vitest 监视模式)",
                value: "npm:::test",
                description: "npm 命令: test\n",
            },
            new Separator(" "),
            new Separator("── 🚀 线上发布 ──────────"),
            {
                name: "正式",
                short: "\n🚀 线上发布：正式",
                value: "publish:::release",
                description: "触发线上发布流程\n",
            },
            {
                name: "预览",
                short: "\n🚀 线上发布：预览",
                value: "publish:::preview",
                description: "触发线上发布流程\n",
            },
            new Separator(" "),
            new Separator("── 👾 本地调试 ──────────"),
            {
                name: "预览",
                short: "\n👾 本地调试",
                value: "preview",
                description: "本地打包并开启 Astro 预览服务器 (Preview)\n",
            },
            {
                name: "PM2: latest",
                short: "\n👾 本地调试：PM2 - latest",
                value: "pm2:::latest",
                description: "使用 PM2 运行 Latest 环境\n",
            },
            {
                name: "PM2: next",
                short: "\n👾 本地调试：PM2 - next",
                value: "pm2:::next",
                description: "使用 PM2 运行 Next 环境\n",
            },
            {
                name: "结束 PM2 服务",
                short: "\n👾 本地调试：结束 PM2 服务",
                value: "pm2:::kill",
                description: "停止 PM2 运行的服务\n",
            },
            new Separator(" "),
        ],
    });

    console.log(" ");

    const [type, command] = answer.split(":::");

    switch (type) {
        case "npm":
            await npmRun(command);
            break;
        case "preview":
            for (const type of ["build", "preview"]) {
                await npmRun([type, command].filter(Boolean).join(":"));
            }
            break;
        case "publish":
            try {
                await new Promise((resolve, reject) => {
                    const child = spawn("astro", `check`.split(" "), {
                        stdio: "inherit",
                        shell: true,
                    });

                    child.on("close", () => {
                        resolve(true);
                    });
                    child.on("error", (error) => {
                        reject(error);
                    });
                    child.on("exit", (exitCode) => {
                        switch (exitCode) {
                            case 0:
                                return resolve(true);
                            default:
                                return reject(
                                    new Error(`类型检查发现代码错误！`, {
                                        cause: `"astro check" exit with code ${exitCode}`,
                                    }),
                                );
                        }
                    });
                });
            } catch (e) {
                if (e) {
                    logError(`Astro`, e);
                    return;
                }
            }
            logSuccess("Astro", "类型检查通过");

            const test = await startVitest(
                "test",
                [], // CLI filters
                {
                    run: true,
                }, // override test config
                {}, // override Vite config
                {}, // custom Vitest options
            );
            if (
                !test.state
                    .getTestModules()
                    .every((testModule) => testModule.ok())
            ) {
                logError("Vitest", "单元测试未通过！");
                return;
            }
            logSuccess("Vitest", "单元测试通过");

            // TODO: build → npx pm2 → test typical links
            // TODO: test image viewer

            const status = execSync("git status --porcelain").toString().trim();
            if (status) {
                logError("Git", "请先提交本地改动！");
                return;
            }
            const tag = `publish-${command}-${dayjs().format(
                `YYYYMMDD`,
            )}-${dayjs().format(`HHmmss`)}`;
            spawnSync(`git`, ["tag", tag], { stdio: "inherit" });
            // spawnSync(`git`, ["push", "origin", tag], { stdio: "inherit", });
            spawnSync(`git`, ["push", "origin", "--tags"], {
                stdio: "inherit",
            });
            logSuccess("Git", "提交完成");
            break;
        case "pm2":
            switch (command) {
                case "kill": {
                    spawnSync(`npx`, `pm2 delete pm2.config.cjs`.split(" "), {
                        stdio: "inherit",
                    });
                    break;
                }
                case "next": {
                    spawnSync(
                        `npx`,
                        `pm2 start pm2.config.cjs --only fly-dbh-v2-next`.split(
                            " ",
                        ),
                        { stdio: "inherit" },
                    );
                    break;
                }
                default:
                    spawnSync(
                        `npx`,
                        `pm2 start pm2.config.cjs --only fly-dbh-v2`.split(" "),
                        { stdio: "inherit" },
                    );
            }
            break;
    }
}

await main().catch((err) => {
    console.trace(err);
});
