import type {
  GestureToken,
  TouchProgram,
  TouchRule,
  TouchRuleMatchPattern,
} from "@touchai/touch-spec";
import { swipeDirection } from "./segment.js";

function approxEqual(a: number, b: number, eps = 1e-3): boolean {
  return Math.abs(a - b) < eps;
}

function gestureEqualsExact(a: GestureToken, b: GestureToken): boolean {
  if (a.kind !== b.kind) return false;
  switch (a.kind) {
    case "tap":
      return (
        b.kind === "tap" &&
        a.pointerCount === b.pointerCount &&
        approxEqual(a.center.x, b.center.x) &&
        approxEqual(a.center.y, b.center.y)
      );
    case "long_press":
      return (
        b.kind === "long_press" &&
        a.pointerCount === b.pointerCount &&
        approxEqual(a.center.x, b.center.x) &&
        approxEqual(a.center.y, b.center.y) &&
        approxEqual(a.durationMs, b.durationMs, 1)
      );
    case "swipe":
      return (
        b.kind === "swipe" &&
        a.pointerCount === b.pointerCount &&
        approxEqual(a.vector.dx, b.vector.dx) &&
        approxEqual(a.vector.dy, b.vector.dy)
      );
    case "pan":
      return (
        b.kind === "pan" &&
        a.pointerCount === b.pointerCount &&
        approxEqual(a.delta.dx, b.delta.dx) &&
        approxEqual(a.delta.dy, b.delta.dy)
      );
    default:
      return false;
  }
}

function matchPattern(pattern: TouchRuleMatchPattern, gesture: GestureToken): boolean {
  if (pattern.kind !== undefined && pattern.kind !== gesture.kind) return false;

  if (pattern.pointerCount !== undefined && pattern.pointerCount !== gesture.pointerCount) {
    return false;
  }

  if (pattern.region && (gesture.kind === "tap" || gesture.kind === "long_press")) {
    const { x, y } = gesture.center;
    const r = pattern.region;
    if (x < r.x0 || x > r.x1 || y < r.y0 || y > r.y1) return false;
  }

  if (gesture.kind === "long_press" || gesture.kind === "tap") {
    if (pattern.minDurationMs !== undefined && gesture.durationMs < pattern.minDurationMs) return false;
    if (pattern.maxDurationMs !== undefined && gesture.durationMs > pattern.maxDurationMs) return false;
  }

  if (gesture.kind === "swipe") {
    if (pattern.direction !== undefined && swipeDirection(gesture.vector) !== pattern.direction) {
      return false;
    }
    if (pattern.minVelocity !== undefined && gesture.velocity < pattern.minVelocity) return false;
  }

  return true;
}

/**
 * First matching rule wins (explicit order = control flow).
 * Supports exact `when.gesture` and qualitative `when.match` patterns.
 */
export function evaluateProgram(program: TouchProgram, gesture: GestureToken): TouchRule | undefined {
  for (const rule of program.rules) {
    const when = rule.when;
    if (when.gesture && gestureEqualsExact(when.gesture, gesture)) return rule;
    if (when.match && matchPattern(when.match, gesture)) return rule;
  }
  return undefined;
}

export { gestureEqualsExact as gestureEquals, matchPattern };
