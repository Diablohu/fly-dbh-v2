import { createProxyMiddleware } from "http-proxy-middleware";

export default (options) => {
    console.log({ options });
    const apiProxy = createProxyMiddleware(options);
    console.log({ apiProxy });

    return {
        name: "proxy",
        hooks: {
            "astro:server:setup": ({ server }) => {
                server.middlewares.use(apiProxy);
            },
        },
    };
};
