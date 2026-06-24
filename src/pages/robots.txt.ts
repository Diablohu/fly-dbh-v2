import type { APIRoute } from "astro";
import getRuntimeEnv from "@/utils/get-runtime-env";

const getRobotsTxt = (site: URL) => `\
User-agent: *
${
    getRuntimeEnv() === "next"
        ? "Disallow: /"
        : `${["/includes/", "/admin/"]
              .map((path) => `Disallow: ${path}`)
              .join("\n")}

Sitemap: ${new URL("sitemap-index.xml", site).href}`
}`;

export const GET: APIRoute = ({ site }) => {
    if (!site) return new Response("Site URL is not defined", { status: 500 });
    return new Response(getRobotsTxt(site));
};
