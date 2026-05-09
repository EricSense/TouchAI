import { describe, expect, it } from "vitest";
import { TOUCHLANG_SPEC_VERSION } from "./version.js";

describe("TOUCHLANG_SPEC_VERSION", () => {
  it("is semver-shaped", () => {
    expect(TOUCHLANG_SPEC_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
