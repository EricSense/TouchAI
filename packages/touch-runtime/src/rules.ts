import type { GestureToken, TouchProgram, TouchRule } from "@touchai/touch-spec";

function gestureEquals(a: GestureToken, b: GestureToken): boolean {
  if (a.kind !== b.kind) return false;
  switch (a.kind) {
    case "tap":
      return (
        b.kind === "tap" &&
        a.pointerCount === b.pointerCount &&
        Math.abs(a.center.x - b.center.x) < 1e-3 &&
        Math.abs(a.center.y - b.center.y) < 1e-3
      );
    case "long_press":
      return (
        b.kind === "long_press" &&
        a.pointerCount === b.pointerCount &&
        Math.abs(a.center.x - b.center.x) < 1e-3 &&
        Math.abs(a.center.y - b.center.y) < 1e-3 &&
        Math.abs(a.durationMs - b.durationMs) < 1
      );
    case "swipe":
      return (
        b.kind === "swipe" &&
        a.pointerCount === b.pointerCount &&
        Math.abs(a.vector.dx - b.vector.dx) < 1e-3 &&
        Math.abs(a.vector.dy - b.vector.dy) < 1e-3
      );
    case "pan":
      return (
        b.kind === "pan" &&
        a.pointerCount === b.pointerCount &&
        Math.abs(a.delta.dx - b.delta.dx) < 1e-3 &&
        Math.abs(a.delta.dy - b.delta.dy) < 1e-3
      );
    default:
      return false;
  }
}

/** First matching rule wins (explicit order = control flow). */
export function evaluateProgram(program: TouchProgram, gesture: GestureToken): TouchRule | undefined {
  for (const rule of program.rules) {
    if (gestureEquals(rule.when.gesture, gesture)) return rule;
  }
  return undefined;
}
