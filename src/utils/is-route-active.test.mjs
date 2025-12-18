import { expect, test } from "vitest";
import isRouteActive from "./is-route-active";

[
    [["/", "/"], true],
    [["/", "/admin"], false],
    [["/videos", "/videos"], true],
    [["/videos", "/admin"], false],
    [["/videos", "/"], false],
    [["/videos", "/videos/tag-world"], true],
    [["/videos", "/videos/tag-world", [/^\/watch\//]], true],
    [["/videos", "/watch/SLUG", [/^\/watch\//]], true],
    [["/videos", "/watch", [/^\/watch\//]], false],
].forEach(([input, output]) => {
    test(`isRouteActive(${input}) => ${output}`, () => {
        expect(isRouteActive(...input)).toBe(output);
    });
});

// /^\/watch\//
