/**
 * Browser mirror of packages/touch-runtime/src/segment.ts.
 *
 * Deterministic v0 segmenter for a single completed pointer path.
 * Keep constants/behavior identical to the TS version.
 */

const DEFAULT_LONG_PRESS_MS = 500;
const DEFAULT_TAP_MAX_MS = 280;
const MOVE_EPS = 0.02;

function dist(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

export function segmentGestureFromPath(samples) {
  if (!samples || samples.length === 0) return null;
  const pointerIds = new Set(samples.map((s) => s.pointerId));
  if (pointerIds.size !== 1) return null;

  const sorted = [...samples].sort((a, b) => a.tMs - b.tMs);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
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
    const velocity = travel / dt;
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

/** Coarse direction label for a swipe vector — for human-readable matching in demos. */
export function swipeDirection(vector) {
  const angle = Math.atan2(vector.dy, vector.dx);
  const deg = (angle * 180) / Math.PI;
  if (deg >= -45 && deg < 45) return "right";
  if (deg >= 45 && deg < 135) return "down";
  if (deg >= -135 && deg < -45) return "up";
  return "left";
}
