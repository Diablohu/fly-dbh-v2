import { ActionError } from "astro:actions";
import { E_0000 } from "@/constants/error-codes";

function getCmsIdOrSlug(idOrSlug: string) {
    const cmsIdOrSlug = idOrSlug.trim();

    if (cmsIdOrSlug === '""' || cmsIdOrSlug === "''" || cmsIdOrSlug === "") {
        const err = new ActionError({
            message: E_0000,
            code: "BAD_REQUEST",
        });
        err.cause = `Invalid CMS ID or Slug: \`${idOrSlug}\``;
        throw err;
    }

    return cmsIdOrSlug;
}

export default getCmsIdOrSlug;
