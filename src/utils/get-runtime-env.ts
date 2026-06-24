/**
 * 获取当前的运行时（打包结果）环境
 */

// let env: Record<string, string | undefined> = import.meta.env;
// console.log({ env });

export default () => {
    return import.meta.env.MODE === "development"
        ? "development"
        : import.meta.env.FLYDBH_BUILD_MODE === "next"
          ? "next"
          : "stable";
};
