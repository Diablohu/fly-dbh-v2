/**
 * @module Sanity 图片 CDN 转发与缓存
 * @description 本 endpoint 仅用于本地开发环境
 */

import fs from "fs-extra";
import path from "node:path";
import { type ReadableStream } from "stream/web";
import { Readable } from "stream";
import { finished } from "stream/promises";
import { type APIRoute } from "astro";
import md5 from "md5";
import { folderNameSanityImagesCache } from "@/server-vars";

// ============================================================================

const target = `https://cdn.sanity.io/images/${process.env.SANITY_PROJECT_ID}/${process.env.SANITY_DATASET}`;
const cacheFolder = path.resolve(folderNameSanityImagesCache);
await fs.ensureDir(cacheFolder);

// ============================================================================

export const ALL: APIRoute = async ({ params, url }) => {
    const fullUrl = `${target}/${params.imagePath}${url.search}`;
    // console.log({ fullUrl });

    try {
        for (const ext of [".jpg", ".jpeg", ".png", ".webp"]) {
            const filename = md5(fullUrl) + ext;
            const file = path.resolve(cacheFolder, filename);
            if (fs.existsSync(file)) return fileToResponse(file);
        }

        const res = await fetch(fullUrl);
        const ext =
            (res.headers.get("content-type") || "").replace(/^image\//, "") ||
            "jpg";
        const filename = md5(fullUrl) + "." + ext;
        const destination = path.resolve(cacheFolder, filename);
        if (fs.existsSync(destination)) await fs.unlink(destination);
        const stream = fs.createWriteStream(destination, {
            flags: "wx",
        });
        await finished(
            Readable.fromWeb(res.body as ReadableStream<any>).pipe(stream)
        );

        return fileToResponse(destination);
    } catch (e) {
        console.log(e);
        console.trace(e);
        return new Response("");
    }
};

async function fileToResponse(file: string) {
    const readStream = fs.createReadStream(file);
    const webReadableStream = Readable.toWeb(readStream);
    return new Response(webReadableStream as BodyInit, {
        headers: {
            "Content-Type": `image/${path.extname(file).replace(/^\./, "")}`,
        },
    });
}
