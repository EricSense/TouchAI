import { describe, expect, it } from "vitest";
import type { TouchSample } from "@touchai/touch-spec";
import { segmentGestureFromPath } from "./segment.js";

function pathTap(center: { x: number; y: number }): TouchSample[] {
  const t0 = 1000;
  return [
    { tMs: t0, phase: "began", pointerId: 0, x: center.x, y: center.y },
    { tMs: t0 + 40, phase: "ended", pointerId: 0, x: center.x, y: center.y },
  ];
}

function pathLongPress(center: { x: number; y: number }): TouchSample[] {
  const t0 = 2000;
  return [
    { tMs: t0, phase: "began", pointerId: 0, x: center.x, y: center.y },
    { tMs: t0 + 520, phase: "ended", pointerId: 0, x: center.x, y: center.y },
  ];
}

function pathSwipe(): TouchSample[] {
  const t0 = 3000;
  return [
    { tMs: t0, phase: "began", pointerId: 0, x: 0.2, y: 0.5 },
    { tMs: t0 + 80, phase: "moved", pointerId: 0, x: 0.45, y: 0.52 },
    { tMs: t0 + 140, phase: "ended", pointerId: 0, x: 0.75, y: 0.55 },
  ];
}

describe("segmentGestureFromPath", () => {
  it("segments tap", () => {
    const g = segmentGestureFromPath(pathTap({ x: 0.5, y: 0.5 }));
    expect(g?.kind).toBe("tap");
  });

  it("segments long press", () => {
    const g = segmentGestureFromPath(pathLongPress({ x: 0.1, y: 0.9 }));
    expect(g?.kind).toBe("long_press");
  });

  it("segments swipe", () => {
    const g = segmentGestureFromPath(pathSwipe());
    expect(g?.kind).toBe("swipe");
    if (g?.kind === "swipe") {
      expect(g.vector.dx).toBeGreaterThan(0.4);
    }
  });
});
