import { describe, expect, it } from "vitest";
import type { GestureToken, TouchProgram } from "@touchai/touch-spec";
import { evaluateProgram } from "./rules.js";

const tap: GestureToken = {
  kind: "tap",
  center: { x: 0.5, y: 0.5 },
  pointerCount: 1,
  durationMs: 50,
};

const exactProgram: TouchProgram = {
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

/** Mirrors public/touchai/program.example.json rule shapes. */
const patternProgram: TouchProgram = {
  rules: [
    {
      id: "tap_anywhere_ack",
      when: { match: { kind: "tap", pointerCount: 1, maxDurationMs: 280 } },
      then: {
        intent: { intentId: "ack", confidence: 0.95 },
        haptic: { kind: "ack_medium" },
      },
    },
    {
      id: "long_press_understood",
      when: { match: { kind: "long_press", pointerCount: 1, minDurationMs: 500 } },
      then: {
        intent: { intentId: "understood", confidence: 0.9 },
        haptic: { kind: "understood" },
      },
    },
    {
      id: "swipe_right_confirm",
      when: { match: { kind: "swipe", direction: "right" } },
      then: {
        intent: { intentId: "confirm", confidence: 0.85 },
        haptic: { kind: "confirm_success" },
      },
    },
    {
      id: "swipe_left_cancel",
      when: { match: { kind: "swipe", direction: "left" } },
      then: {
        intent: { intentId: "cancel", confidence: 0.85 },
        haptic: { kind: "confirm_warning" },
      },
    },
  ],
};

describe("evaluateProgram — exact gesture", () => {
  it("returns first matching rule", () => {
    const hit = evaluateProgram(exactProgram, tap);
    expect(hit?.id).toBe("r1");
    expect(hit?.then.intent?.intentId).toBe("open_palette");
  });
});

describe("evaluateProgram — pattern match", () => {
  it("matches tap by kind and duration", () => {
    const hit = evaluateProgram(patternProgram, tap);
    expect(hit?.id).toBe("tap_anywhere_ack");
  });

  it("matches long press", () => {
    const gesture: GestureToken = {
      kind: "long_press",
      center: { x: 0.2, y: 0.8 },
      durationMs: 600,
      pointerCount: 1,
    };
    const hit = evaluateProgram(patternProgram, gesture);
    expect(hit?.id).toBe("long_press_understood");
  });

  it("matches swipe direction", () => {
    const right: GestureToken = {
      kind: "swipe",
      origin: { x: 0.1, y: 0.5 },
      vector: { dx: 0.6, dy: 0.05 },
      velocity: 0.004,
      pointerCount: 1,
    };
    expect(evaluateProgram(patternProgram, right)?.id).toBe("swipe_right_confirm");

    const left: GestureToken = {
      kind: "swipe",
      origin: { x: 0.9, y: 0.5 },
      vector: { dx: -0.6, dy: 0.05 },
      velocity: 0.004,
      pointerCount: 1,
    };
    expect(evaluateProgram(patternProgram, left)?.id).toBe("swipe_left_cancel");
  });

  it("respects rule order — first match wins", () => {
    const program: TouchProgram = {
      rules: [
        {
          id: "first",
          when: { match: { kind: "tap" } },
          then: { intent: { intentId: "a", confidence: 1 } },
        },
        {
          id: "second",
          when: { match: { kind: "tap", maxDurationMs: 280 } },
          then: { intent: { intentId: "b", confidence: 1 } },
        },
      ],
    };
    expect(evaluateProgram(program, tap)?.id).toBe("first");
  });

  it("returns undefined when no rule matches", () => {
    const pan: GestureToken = { kind: "pan", delta: { dx: 0.1, dy: 0 }, pointerCount: 1 };
    expect(evaluateProgram(patternProgram, pan)).toBeUndefined();
  });
});
