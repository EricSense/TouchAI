/**
 * Browser mirror of packages/touch-adapter-web/src/pointer.ts.
 * Same name (`touchSampleFromPointerEvent`) and same shape as the npm package.
 */

function clamp01(n) {
  return Math.min(1, Math.max(0, n));
}

function phaseFromEventType(type) {
  if (type === "pointerdown") return "began";
  if (type === "pointerup") return "ended";
  if (type === "pointercancel") return "cancelled";
  return "moved";
}

export function touchSampleFromPointerEvent(event, element, sessionStartMs) {
  const rect = element.getBoundingClientRect();
  const w = Math.max(rect.width, 1);
  const h = Math.max(rect.height, 1);
  const x = clamp01((event.clientX - rect.left) / w);
  const y = clamp01((event.clientY - rect.top) / h);
  const tMs = Math.max(0, performance.now() - sessionStartMs);
  const phase = phaseFromEventType(event.type);
  const pointerId = event.pointerId;

  const sample = { tMs, phase, pointerId, x, y };
  if (typeof event.pressure === "number" && event.pressure > 0) {
    sample.pressure = clamp01(event.pressure);
  }
  return sample;
}
