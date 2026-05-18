import { describe, expect, it } from "vitest";
import type { TouchSample } from "@touchai/touch-spec";
import { computeSessionProfile, normalizeSamples } from "./session.js";

describe("computeSessionProfile", () => {
  it("derives pressure baseline from stream", () => {
    const stream: TouchSample[] = [
      { tMs: 0, phase: "began", pointerId: 0, x: 0.5, y: 0.5, pressure: 0.4 },
      { tMs: 50, phase: "ended", pointerId: 0, x: 0.5, y: 0.5, pressure: 0.8 },
    ];
    const profile = computeSessionProfile(stream);
    expect(profile.pressureBaseline).toBe(0.8);
    expect(profile.sampleCount).toBe(2);
  });

  it("normalizes pressure relative to baseline", () => {
    const stream: TouchSample[] = [
      { tMs: 0, phase: "began", pointerId: 0, x: 0.5, y: 0.5, pressure: 0.5 },
      { tMs: 50, phase: "ended", pointerId: 0, x: 0.5, y: 0.5, pressure: 1 },
    ];
    const profile = computeSessionProfile(stream);
    const normalized = normalizeSamples(stream, profile);
    expect(normalized[1]?.pressure).toBeCloseTo(1);
    expect(normalized[0]?.pressure).toBeCloseTo(0.5);
  });
});
