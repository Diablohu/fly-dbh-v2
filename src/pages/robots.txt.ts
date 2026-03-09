import type { APIRoute } from "astro";

const getRobotsTxt = (site: URL) => `\
User-agent: *
${(import.meta.env.FLYDBH_BUILD_MODE === "next"
    ? ["/"]
    : ["/includes/", "/admin/"]
)
    .map((path) => `Disallow: ${path}`)
    .join("\n")}

Sitemap: ${new URL("sitemap-index.xml", site).href}
`;

export const GET: APIRoute = ({ site }) => {
    if (!site) return new Response("Site URL is not defined", { status: 500 });
    return new Response(getRobotsTxt(site));
};
