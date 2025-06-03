import { spawn, execSync } from "node:child_process";
import dayjs from "dayjs";
import { select, Separator } from "@inquirer/prompts";
import npmRunScript from "npm-run-script";
import p from "./package.json" assert { type: "json" };

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
                value: "npm:dev",
                description: "npm 命令: dev\n",
            },
            {
                name: "分析打包文件尺寸",
                short: "\n🚧 执行打包，并自动生成分析报告",
                value: "npm:analyze",
                description: "执行打包，并自动生成分析报告\n",
            },
            new Separator(" "),
            new Separator("── 🚀 线上发布 ──────────"),
            {
                name: "发布",
                short: "\n🚀 线上发布",
                value: "publish",
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
            new Separator(" "),
        ],
    });

    console.log(" ");

    const [type, command] = answer.split(":");

    switch (type) {
        case "npm":
            npmRunScript(p.scripts[command], { stdio: "inherit" });
            break;
        case "preview":
            for (const type of ["build", "preview"]) {
                await new Promise((resolve) => {
                    const child = npmRunScript(
                        p.scripts[`${type}:${command}`],
                        {
                            stdio: "inherit",
                        }
                    );
                    child.on("close", () => {
                        resolve(true);
                    });
                });
            }
            break;
        case "publish":
            const status = execSync("git status --porcelain").toString().trim();
            if (status) {
                console.error("⛔ 请先提交本地的改动！");
                return;
            }
            const tag = `release-${command}-online-${dayjs().format(
                `YYYYMMDD`
            )}-${dayjs().format(`HHmmss`)}`;
            spawn(`git`, ["tag", tag], { stdio: "inherit" });
            spawn(`git`, ["push", "origin", tag], { stdio: "inherit" });
            break;
    }
}

await main().catch((err) => {
    console.trace(err);
});
