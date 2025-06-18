import { createProxyMiddleware } from "http-proxy-middleware";

export default (options) => {
    const apiProxy = createProxyMiddleware(options);

    return {
        name: "proxy",
        hooks: {
            "astro:server:setup": ({ server }) => {
                server.middlewares.use(apiProxy);
            },
        },
    };
};
