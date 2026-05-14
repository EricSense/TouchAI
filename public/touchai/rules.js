/**
 * Browser-friendly TouchProgram evaluator.
 *
 * Supports two condition modes, both serializable in JSON:
 *   1. Exact match  - `when.gesture` mirrors packages/touch-runtime/src/rules.ts (gestureEquals).
 *   2. Pattern match - `when.match` lets demo programs match by gesture kind and qualitative
 *      slots (e.g. `direction: "right"`, `minDurationMs`, `maxDurationMs`, region box).
 *      This stays additive: a future TS pattern matcher can implement the same shape.
 *
 * First matching rule wins (explicit order = control flow).
 */

import { swipeDirection } from "./segment.js";

function approxEqual(a, b, eps = 1e-3) {
  return Math.abs(a - b) < eps;
}

function gestureEqualsExact(a, b) {
  if (!a || !b || a.kind !== b.kind) return false;
  switch (a.kind) {
    case "tap":
      return (
        a.pointerCount === b.pointerCount &&
        approxEqual(a.center.x, b.center.x) &&
        approxEqual(a.center.y, b.center.y)
      );
    case "long_press":
      return (
        a.pointerCount === b.pointerCount &&
        approxEqual(a.center.x, b.center.x) &&
        approxEqual(a.center.y, b.center.y) &&
        approxEqual(a.durationMs, b.durationMs, 1)
      );
    case "swipe":
      return (
        a.pointerCount === b.pointerCount &&
        approxEqual(a.vector.dx, b.vector.dx) &&
        approxEqual(a.vector.dy, b.vector.dy)
      );
    case "pan":
      return (
        a.pointerCount === b.pointerCount &&
        approxEqual(a.delta.dx, b.delta.dx) &&
        approxEqual(a.delta.dy, b.delta.dy)
      );
    default:
      return false;
  }
}

function matchPattern(pattern, gesture) {
  if (!pattern || !gesture) return false;
  if (pattern.kind && pattern.kind !== gesture.kind) return false;

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

  if (gesture.kind === "swipe" && pattern.direction) {
    if (swipeDirection(gesture.vector) !== pattern.direction) return false;
    if (pattern.minVelocity !== undefined && gesture.velocity < pattern.minVelocity) return false;
  }

  return true;
}

export function evaluateProgram(program, gesture) {
  if (!program || !Array.isArray(program.rules)) return undefined;
  for (const rule of program.rules) {
    const cond = rule.when ?? {};
    if (cond.gesture && gestureEqualsExact(cond.gesture, gesture)) return rule;
    if (cond.match && matchPattern(cond.match, gesture)) return rule;
  }
  return undefined;
}
