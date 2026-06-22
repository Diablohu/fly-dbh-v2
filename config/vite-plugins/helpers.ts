/**
 * Astro v6 之后，Vite 打包时的 `outDir` 会固定为 `dist/server`
 * 因此，使用这一路径的 `vite-plugin-static-copy` 插件的 `dest` 也需要相应调整。
 *
 * UPDATE 260623: Vite 8 已解决了该问题
 *  - 该函数保留，以应对未来可能的变动
 *  - 当前直接返回空字符串
 * 
 * COMMENT: 如果 Astro 团队在未来提供了更灵活的 `outDir` 配置选项，可以考虑移除这个函数，直接使用固定路径。
 */
export const getViteStaticCopyDestBase = () => "";
// process.env.NODE_ENV === "development" ? "" : "../client/";
// process.env.NODE_ENV === "";
