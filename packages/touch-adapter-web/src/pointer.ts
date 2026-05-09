import type { TouchSample } from "@touchai/touch-spec";

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

function phaseFromEventType(type: string): TouchSample["phase"] {
  if (type === "pointerdown") return "began";
  if (type === "pointerup") return "ended";
  if (type === "pointercancel") return "cancelled";
  return "moved";
}

/**
 * Map a `PointerEvent` on `element` to a `TouchSample` in normalized view space.
 * `sessionStartMs` should be `performance.now()` captured when the touch session began.
 */
export function touchSampleFromPointerEvent(
  event: PointerEvent,
  element: HTMLElement,
  sessionStartMs: number,
): TouchSample {
  const rect = element.getBoundingClientRect();
  const w = Math.max(rect.width, 1);
  const h = Math.max(rect.height, 1);
  const x = clamp01((event.clientX - rect.left) / w);
  const y = clamp01((event.clientY - rect.top) / h);
  const tMs = Math.max(0, performance.now() - sessionStartMs);
  const phase = phaseFromEventType(event.type);
  const pointerId = event.pointerId;

  let pressure: number | undefined;
  if (typeof event.pressure === "number" && event.pressure > 0) {
    pressure = clamp01(event.pressure);
  }

  return { tMs, phase, pointerId, x, y, pressure };
}
