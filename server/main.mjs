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

await import("../dist/server/entry.mjs");
