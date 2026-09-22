import { expect, test } from "vitest";
import { urlPrefixSanityImageCdn } from "@/global";
import getSanityImageUrl from "./get-sanity-image-url";

const filename = "def7240d06fe76f40b3df3e572e5e733dd6256b8-2278x1280.jpg";

[
    [
        "无参数",
        [
            [filename, undefined, undefined, filename],
            [
                `/test/${filename}`,
                undefined,
                undefined,
                { expect: `/test/${filename}` },
            ],
            [
                `/test/${filename}?q=60`,
                undefined,
                undefined,
                { expect: `/test/${filename}?q=60` },
            ],
            [
                `https://next.fly-dbh.com/sanity-image/${filename}`,
                undefined,
                undefined,
                { expect: `https://next.fly-dbh.com/sanity-image/${filename}` },
            ],
            [
                `https://next.fly-dbh.com/sanity-image/${filename}?w=1280`,
                undefined,
                undefined,
                {
                    expect: `https://next.fly-dbh.com/sanity-image/${filename}?w=1280`,
                },
            ],
            [
                new URL(
                    `https://next.fly-dbh.com/sanity-image/${filename}?auto=format`,
                ),
                undefined,
                undefined,
                {
                    expect: `https://next.fly-dbh.com/sanity-image/${filename}?auto=format`,
                },
            ],
        ],
    ],
    [
        "附加参数",
        [
            [
                filename,
                {
                    fm: "auto",
                },
                undefined,
                `${filename}?auto=format`,
            ],
            [
                filename,
                {
                    format: "webp",
                    quality: 80,
                },
                undefined,
                `${filename}?fm=webp&q=80`,
            ],
            [
                filename,
                {
                    format: "webp",
                    quality: 80.9,
                },
                undefined,
                `${filename}?fm=webp&q=80`,
            ],
            [
                filename,
                {
                    width: 100.1,
                },
                undefined,
                `${filename}?w=100`,
            ],
            [
                new URL(`https://next.fly-dbh.com/sanity-image/${filename}`),
                { blur: 50 },
                undefined,
                {
                    expect: `https://next.fly-dbh.com/sanity-image/${filename}?blur=50`,
                },
            ],
        ],
    ],
    [
        "修改参数",
        [
            [
                `${filename}?fm=webp`,
                {
                    format: "auto",
                },
                undefined,
                `${filename}?auto=format`,
            ],
            [`${filename}?fm=webp`, undefined, ["format"], `${filename}`],
            [`${filename}?auto=format`, undefined, ["format"], `${filename}`],
            [`${filename}?auto=format`, undefined, ["fm"], `${filename}`],
            [
                `${filename}?auto=format&q=50`,
                undefined,
                ["fm"],
                `${filename}?q=50`,
            ],
            [
                `${filename}?auto=format&q=50`,
                {
                    quality: 80,
                },
                ["fm"],
                `${filename}?q=80`,
            ],
            [
                `${filename}?auto=format&q=50`,
                {
                    quality: 80,
                    width: 100,
                },
                ["fm"],
                `${filename}?q=80&w=100`,
            ],
            [
                `${filename}?auto=format&q=50`,
                {
                    width: 100,
                },
                ["fm", "quality"],
                `${filename}?w=100`,
            ],
            [
                new URL(
                    `https://next.fly-dbh.com/sanity-image/${filename}?q=60&w=1280`,
                ),
                { blur: 50 },
                ["quality", "width"],
                {
                    expect: `https://next.fly-dbh.com/sanity-image/${filename}?blur=50`,
                },
            ],
        ],
    ],
].forEach(([name, tests]) => {
    test(name, () => {
        tests.forEach(([filename, settings, removeAttributes, output]) => {
            expect(
                getSanityImageUrl(filename, settings, removeAttributes),
            ).toMatch(
                typeof output === "string"
                    ? `${urlPrefixSanityImageCdn}/${output}`
                    : output.expect,
            );
        });
    });
});
