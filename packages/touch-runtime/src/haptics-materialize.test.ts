import { describe, expect, it } from "vitest";
import type { HapticSemantic } from "@touchai/touch-spec";
import { materializeHapticSemantic } from "./haptics-materialize.js";

const SEMANTICS: HapticSemantic[] = [
  { kind: "ack_light" },
  { kind: "ack_medium" },
  { kind: "ack_heavy" },
  { kind: "confirm_success" },
  { kind: "confirm_warning" },
  { kind: "confirm_error" },
  { kind: "understood" },
  { kind: "clarify" },
  {
    kind: "custom",
    program: {
      id: "custom_demo",
      pulses: [{ delayMs: 0, intensity: 0.5, sharpness: 0.5, durationMs: 20 }],
    },
  },
];

describe("materializeHapticSemantic", () => {
  it.each(SEMANTICS.map((s) => [s.kind, s] as const))("materializes %s", (kind, semantic) => {
    const program = materializeHapticSemantic(semantic);
    expect(program.id).toBeTruthy();
    expect(program.pulses.length).toBeGreaterThan(0);
    for (const p of program.pulses) {
      expect(p.durationMs).toBeGreaterThan(0);
      expect(p.intensity).toBeGreaterThanOrEqual(0);
      expect(p.intensity).toBeLessThanOrEqual(1);
    }
    if (kind === "custom") expect(program.id).toBe("custom_demo");
  });

  it("confirm_success uses multiple pulses", () => {
    const p = materializeHapticSemantic({ kind: "confirm_success" });
    expect(p.pulses.length).toBe(2);
  });
});
