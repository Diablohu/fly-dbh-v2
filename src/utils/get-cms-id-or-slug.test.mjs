import { expect, test } from "vitest";
import getCmsIdOrSlug from "./get-cms-id-or-slug";
import { E_0000 } from "@/constants/error-codes";

test("字符串 Trim", () => {
    expect(getCmsIdOrSlug(" test ")).toBe("test");
    expect(getCmsIdOrSlug(" test")).toBe("test");
    expect(getCmsIdOrSlug("test ")).toBe("test");
});
test("无效输入", () => {
    expect(() => getCmsIdOrSlug("''")).toThrow(E_0000);
    expect(() => getCmsIdOrSlug('""')).toThrow(E_0000);
    expect(() => getCmsIdOrSlug("   ")).toThrow(E_0000);
});
