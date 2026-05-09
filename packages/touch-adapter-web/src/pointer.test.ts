import { describe, expect, it } from "vitest";
import { touchSampleFromPointerEvent } from "./pointer.js";

describe("touchSampleFromPointerEvent", () => {
  it("normalizes coordinates into 0–1", () => {
    const el = {
      getBoundingClientRect: () => ({
        left: 100,
        top: 50,
        width: 200,
        height: 100,
        right: 300,
        bottom: 150,
        x: 100,
        y: 50,
        toJSON: () => ({}),
      }),
    } as unknown as HTMLElement;

    const ev = {
      type: "pointerdown",
      clientX: 200,
      clientY: 100,
      pointerId: 7,
      pressure: 0.5,
    } as unknown as PointerEvent;

    const s = touchSampleFromPointerEvent(ev, el, 1000);
    expect(s.phase).toBe("began");
    expect(s.pointerId).toBe(7);
    expect(s.x).toBeCloseTo(0.5);
    expect(s.y).toBeCloseTo(0.5);
    expect(s.pressure).toBeCloseTo(0.5);
    expect(s.tMs).toBeGreaterThanOrEqual(0);
  });
});
