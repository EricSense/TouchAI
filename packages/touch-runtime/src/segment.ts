import type { GestureToken, SessionProfile, TouchSample } from "@touchai/touch-spec";
import {
  computeSessionProfile,
  normalizeSamples,
  sessionRelativeVelocity,
  splitStreamByPointer,
} from "./session.js";

const DEFAULT_LONG_PRESS_MS = 500;
const DEFAULT_TAP_MAX_MS = 280;
const MOVE_EPS = 0.02;
const PINCH_SCALE_EPS = 0.12;

function dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function pathComplete(path: TouchSample[]): boolean {
  if (path.length === 0) return false;
  const sorted = [...path].sort((a, b) => a.tMs - b.tMs);
  const first = sorted[0]!;
  const last = sorted[sorted.length - 1]!;
  return first.phase === "began" && (last.phase === "ended" || last.phase === "cancelled");
}

function pinchCenter(a: TouchSample, b: TouchSample): { x: number; y: number } {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function segmentPinch(pathA: TouchSample[], pathB: TouchSample[]): GestureToken | null {
  if (!pathComplete(pathA) || !pathComplete(pathB)) return null;

  const a = [...pathA].sort((x, y) => x.tMs - y.tMs);
  const b = [...pathB].sort((x, y) => x.tMs - y.tMs);
  const startA = a[0]!;
  const startB = b[0]!;
  const endA = a[a.length - 1]!;
  const endB = b[b.length - 1]!;

  const d0 = dist(startA, startB);
  const d1 = dist(endA, endB);
  if (d0 < MOVE_EPS) return null;

  const scale = d1 / d0;
  if (Math.abs(scale - 1) < PINCH_SCALE_EPS) return null;

  const durationMs = Math.max(endA.tMs - startA.tMs, endB.tMs - startB.tMs);
  return {
    kind: "pinch",
    center: pinchCenter(endA, endB),
    scale,
    pointerCount: 2,
    durationMs,
  };
}

function segmentTwoFingerSwipe(
  pathA: TouchSample[],
  pathB: TouchSample[],
  profile: SessionProfile,
): GestureToken | null {
  if (!pathComplete(pathA) || !pathComplete(pathB)) return null;

  const gA = segmentGestureFromPath(pathA, profile);
  const gB = segmentGestureFromPath(pathB, profile);
  if (gA?.kind !== "swipe" || gB?.kind !== "swipe") return null;

  const vA = gA.vector;
  const vB = gB.vector;
  const magA = Math.hypot(vA.dx, vA.dy);
  const magB = Math.hypot(vB.dx, vB.dy);
  if (magA < MOVE_EPS || magB < MOVE_EPS) return null;

  const dot = (vA.dx * vB.dx + vA.dy * vB.dy) / (magA * magB);
  if (dot < 0.75) return null;

  const dx = (vA.dx + vB.dx) / 2;
  const dy = (vA.dy + vB.dy) / 2;
  const velocity = (gA.velocity + gB.velocity) / 2;

  return {
    kind: "two_finger_swipe",
    origin: { x: (gA.origin.x + gB.origin.x) / 2, y: (gA.origin.y + gB.origin.y) / 2 },
    vector: { dx, dy },
    velocity,
    pointerCount: 2,
  };
}

function segmentMultiPointer(paths: Map<number, TouchSample[]>, profile: SessionProfile): GestureToken | null {
  if (paths.size !== 2) return null;
  const [pathA, pathB] = [...paths.values()];
  if (!pathA || !pathB) return null;

  const pinch = segmentPinch(pathA, pathB);
  if (pinch) return pinch;

  return segmentTwoFingerSwipe(pathA, pathB, profile);
}

/**
 * Top-level segmenter: session normalization + single or dual-pointer gestures.
 */
export function segmentGestureFromStream(stream: TouchSample[]): GestureToken | null {
  if (stream.length === 0) return null;

  const profile = computeSessionProfile(stream);
  const normalized = normalizeSamples(stream, profile);
  const paths = splitStreamByPointer(normalized);

  if (paths.size === 2) {
    const multi = segmentMultiPointer(paths, profile);
    if (multi) return multi;
  }

  if (paths.size === 1) {
    const only = paths.values().next().value;
    if (only) return segmentGestureFromPath(only, profile);
  }

  for (const path of paths.values()) {
    const g = segmentGestureFromPath(path, profile);
    if (g) return g;
  }
  return null;
}

/**
 * Deterministic segmenter for a single completed pointer path.
 * Pass an optional SessionProfile to emit session-relative swipe velocity.
 */
export function segmentGestureFromPath(samples: TouchSample[], profile?: SessionProfile): GestureToken | null {
  if (samples.length === 0) return null;
  const pointerIds = new Set(samples.map((s) => s.pointerId));
  if (pointerIds.size !== 1) return null;

  const sorted = [...samples].sort((a, b) => a.tMs - b.tMs);
  const first = sorted[0]!;
  const last = sorted[sorted.length - 1]!;
  if (first.phase !== "began" || (last.phase !== "ended" && last.phase !== "cancelled")) {
    return null;
  }

  const durationMs = last.tMs - first.tMs;
  const maxMove = sorted.reduce((m, s) => Math.max(m, dist(first, s)), 0);
  const pointerCount = 1;

  if (maxMove < MOVE_EPS) {
    if (durationMs >= DEFAULT_LONG_PRESS_MS) {
      return {
        kind: "long_press",
        center: { x: first.x, y: first.y },
        durationMs,
        pointerCount,
      };
    }
    if (durationMs <= DEFAULT_TAP_MAX_MS) {
      return {
        kind: "tap",
        center: { x: first.x, y: first.y },
        pointerCount,
        durationMs,
      };
    }
  }

  const dx = last.x - first.x;
  const dy = last.y - first.y;
  const travel = Math.hypot(dx, dy);
  if (travel >= MOVE_EPS * 3) {
    const dt = Math.max(1, last.tMs - first.tMs);
    const rawVelocity = travel / dt;
    const velocity = profile ? sessionRelativeVelocity(rawVelocity, profile) : rawVelocity;
    return {
      kind: "swipe",
      origin: { x: first.x, y: first.y },
      vector: { dx, dy },
      velocity,
      pointerCount,
    };
  }

  return {
    kind: "tap",
    center: { x: first.x, y: first.y },
    pointerCount,
    durationMs,
  };
}

/** Coarse direction label for swipe vectors — shared by rule pattern matching. */
export function swipeDirection(vector: { dx: number; dy: number }): "up" | "down" | "left" | "right" {
  const angle = Math.atan2(vector.dy, vector.dx);
  const deg = (angle * 180) / Math.PI;
  if (deg >= -45 && deg < 45) return "right";
  if (deg >= 45 && deg < 135) return "down";
  if (deg >= -135 && deg < -45) return "up";
  return "left";
}
