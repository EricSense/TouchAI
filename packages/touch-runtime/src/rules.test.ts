import { describe, expect, it } from "vitest";
import type { GestureToken, TouchProgram } from "@touchai/touch-spec";
import { evaluateProgram } from "./rules.js";

const tap: GestureToken = {
  kind: "tap",
  center: { x: 0.5, y: 0.5 },
  pointerCount: 1,
  durationMs: 50,
};

const program: TouchProgram = {
  rules: [
    {
      id: "r1",
      when: { gesture: { ...tap } },
      then: {
        intent: { intentId: "open_palette", confidence: 1 },
        haptic: { kind: "ack_medium" },
      },
    },
  ],
};

describe("evaluateProgram", () => {
  it("returns first matching rule", () => {
    const hit = evaluateProgram(program, tap);
    expect(hit?.id).toBe("r1");
    expect(hit?.then.intent?.intentId).toBe("open_palette");
  });
});
