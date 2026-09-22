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
                `https://next.fly-dbh.com/sanity-image/${filename}`,
                undefined,
                undefined,
                { expect: `https://next.fly-dbh.com/sanity-image/${filename}` },
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
                    width: 100.1,
                },
                undefined,
                `${filename}?w=100`,
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
