import { describe, expect, it } from "vitest";
import type { TouchSample } from "@touchai/touch-spec";
import { segmentGestureFromStream } from "./segment.js";

function pinchStream(): TouchSample[] {
  const t0 = 1000;
  return [
    { tMs: t0, phase: "began", pointerId: 0, x: 0.35, y: 0.5 },
    { tMs: t0, phase: "began", pointerId: 1, x: 0.65, y: 0.5 },
    { tMs: t0 + 120, phase: "moved", pointerId: 0, x: 0.42, y: 0.5 },
    { tMs: t0 + 120, phase: "moved", pointerId: 1, x: 0.58, y: 0.5 },
    { tMs: t0 + 140, phase: "ended", pointerId: 0, x: 0.45, y: 0.5 },
    { tMs: t0 + 140, phase: "ended", pointerId: 1, x: 0.55, y: 0.5 },
  ];
}

function twoFingerSwipeStream(): TouchSample[] {
  const t0 = 2000;
  return [
    { tMs: t0, phase: "began", pointerId: 0, x: 0.2, y: 0.4 },
    { tMs: t0, phase: "began", pointerId: 1, x: 0.2, y: 0.6 },
    { tMs: t0 + 100, phase: "moved", pointerId: 0, x: 0.7, y: 0.41 },
    { tMs: t0 + 100, phase: "moved", pointerId: 1, x: 0.7, y: 0.61 },
    { tMs: t0 + 120, phase: "ended", pointerId: 0, x: 0.75, y: 0.42 },
    { tMs: t0 + 120, phase: "ended", pointerId: 1, x: 0.75, y: 0.62 },
  ];
}

describe("segmentGestureFromStream", () => {
  it("segments pinch when two fingers converge", () => {
    const g = segmentGestureFromStream(pinchStream());
    expect(g?.kind).toBe("pinch");
    if (g?.kind === "pinch") {
      expect(g.scale).toBeLessThan(1);
      expect(g.pointerCount).toBe(2);
    }
  });

  it("segments two_finger_swipe when both fingers move together", () => {
    const g = segmentGestureFromStream(twoFingerSwipeStream());
    expect(g?.kind).toBe("two_finger_swipe");
    if (g?.kind === "two_finger_swipe") {
      expect(g.vector.dx).toBeGreaterThan(0.4);
      expect(g.pointerCount).toBe(2);
    }
  });

  it("falls back to single-pointer swipe", () => {
    const t0 = 3000;
    const stream: TouchSample[] = [
      { tMs: t0, phase: "began", pointerId: 0, x: 0.2, y: 0.5 },
      { tMs: t0 + 100, phase: "moved", pointerId: 0, x: 0.75, y: 0.52 },
      { tMs: t0 + 120, phase: "ended", pointerId: 0, x: 0.8, y: 0.53 },
    ];
    const g = segmentGestureFromStream(stream);
    expect(g?.kind).toBe("swipe");
  });
});
