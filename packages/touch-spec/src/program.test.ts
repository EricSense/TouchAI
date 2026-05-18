import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { TouchProgramSchema } from "@touchai/touch-spec";

const here = dirname(fileURLToPath(import.meta.url));
const examplePath = join(here, "..", "..", "..", "public", "touchai", "program.example.json");

describe("TouchProgramSchema", () => {
  it("validates the playground example program", () => {
    const raw = JSON.parse(readFileSync(examplePath, "utf8")) as unknown;
    const parsed = TouchProgramSchema.safeParse(raw);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.rules.length).toBeGreaterThanOrEqual(4);
    }
  });

  it("rejects when with neither gesture nor match", () => {
    const parsed = TouchProgramSchema.safeParse({
      rules: [{ id: "bad", when: {}, then: {} }],
    });
    expect(parsed.success).toBe(false);
  });
});
