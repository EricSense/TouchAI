/**
 * TouchAI playground runtime bundle.
 * Generated from @touchai/* packages — regenerate with: npm run build:all
 */
const TOUCHLANG_SPEC_VERSION = "0.1.0";

function clamp01(n) {
  return Math.min(1, Math.max(0, n));
}

function phaseFromEventType(type) {
  if (type === "pointerdown") return "began";
  if (type === "pointerup") return "ended";
  if (type === "pointercancel") return "cancelled";
  return "moved";
}

function touchSampleFromPointerEvent(event, element, sessionStartMs) {
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

const DEFAULT_LONG_PRESS_MS = 500;
const DEFAULT_TAP_MAX_MS = 280;
const MOVE_EPS = 0.02;

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function segmentGestureFromPath(samples) {
  if (!samples || samples.length === 0) return null;
  const pointerIds = new Set(samples.map((s) => s.pointerId));
  if (pointerIds.size !== 1) return null;
  const sorted = [...samples].sort((a, b) => a.tMs - b.tMs);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  if (first.phase !== "began" || (last.phase !== "ended" && last.phase !== "cancelled")) return null;
  const durationMs = last.tMs - first.tMs;
  const maxMove = sorted.reduce((m, s) => Math.max(m, dist(first, s)), 0);
  const pointerCount = 1;
  if (maxMove < MOVE_EPS) {
    if (durationMs >= DEFAULT_LONG_PRESS_MS) {
      return { kind: "long_press", center: { x: first.x, y: first.y }, durationMs, pointerCount };
    }
    if (durationMs <= DEFAULT_TAP_MAX_MS) {
      return { kind: "tap", center: { x: first.x, y: first.y }, pointerCount, durationMs };
    }
  }
  const dx = last.x - first.x;
  const dy = last.y - first.y;
  const travel = Math.hypot(dx, dy);
  if (travel >= MOVE_EPS * 3) {
    const dt = Math.max(1, last.tMs - first.tMs);
    return {
      kind: "swipe",
      origin: { x: first.x, y: first.y },
      vector: { dx, dy },
      velocity: travel / dt,
      pointerCount,
    };
  }
  return { kind: "tap", center: { x: first.x, y: first.y }, pointerCount, durationMs };
}

function swipeDirection(vector) {
  const deg = (Math.atan2(vector.dy, vector.dx) * 180) / Math.PI;
  if (deg >= -45 && deg < 45) return "right";
  if (deg >= 45 && deg < 135) return "down";
  if (deg >= -135 && deg < -45) return "up";
  return "left";
}

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
  if (pattern.kind !== undefined && pattern.kind !== gesture.kind) return false;
  if (pattern.pointerCount !== undefined && pattern.pointerCount !== gesture.pointerCount) return false;
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
    if (pattern.direction !== undefined && swipeDirection(gesture.vector) !== pattern.direction) return false;
    if (pattern.minVelocity !== undefined && gesture.velocity < pattern.minVelocity) return false;
  }
  return true;
}

function evaluateProgram(program, gesture) {
  for (const rule of program.rules) {
    const when = rule.when ?? {};
    if (when.gesture && gestureEqualsExact(when.gesture, gesture)) return rule;
    if (when.match && matchPattern(when.match, gesture)) return rule;
  }
  return undefined;
}

function pulse(id, pulses) {
  return { id, pulses };
}

function materializeHapticSemantic(semantic) {
  switch (semantic.kind) {
    case "ack_light":
      return pulse("ack_light", [{ delayMs: 0, intensity: 0.35, sharpness: 0.9, durationMs: 12 }]);
    case "ack_medium":
      return pulse("ack_medium", [{ delayMs: 0, intensity: 0.55, sharpness: 0.85, durationMs: 18 }]);
    case "ack_heavy":
      return pulse("ack_heavy", [{ delayMs: 0, intensity: 0.75, sharpness: 0.8, durationMs: 28 }]);
    case "confirm_success":
      return pulse("confirm_success", [
        { delayMs: 0, intensity: 0.45, sharpness: 0.85, durationMs: 14 },
        { delayMs: 60, intensity: 0.65, sharpness: 0.75, durationMs: 22 },
      ]);
    case "confirm_warning":
      return pulse("confirm_warning", [
        { delayMs: 0, intensity: 0.55, sharpness: 0.95, durationMs: 40 },
        { delayMs: 90, intensity: 0.55, sharpness: 0.95, durationMs: 40 },
      ]);
    case "confirm_error":
      return pulse("confirm_error", [
        { delayMs: 0, intensity: 0.85, sharpness: 0.95, durationMs: 55 },
        { delayMs: 100, intensity: 0.85, sharpness: 0.95, durationMs: 55 },
        { delayMs: 200, intensity: 0.85, sharpness: 0.95, durationMs: 55 },
      ]);
    case "understood":
      return pulse("understood", [
        { delayMs: 0, intensity: 0.4, sharpness: 0.9, durationMs: 10 },
        { delayMs: 35, intensity: 0.55, sharpness: 0.75, durationMs: 16 },
        { delayMs: 85, intensity: 0.35, sharpness: 0.85, durationMs: 10 },
      ]);
    case "clarify":
      return pulse("clarify", [
        { delayMs: 0, intensity: 0.5, sharpness: 0.6, durationMs: 30 },
        { delayMs: 120, intensity: 0.5, sharpness: 0.6, durationMs: 30 },
      ]);
    case "custom":
      return semantic.program;
    default:
      return pulse("noop", [{ delayMs: 0, intensity: 0, sharpness: 0, durationMs: 1 }]);
  }
}

class WebHapticProgramPlayer {
  constructor(nav = typeof navigator !== "undefined" ? navigator : null) {
    this.nav = nav;
  }
  isSupported() {
    return typeof this.nav?.vibrate === "function";
  }
  buildPattern(program) {
    const pattern = [];
    let lastStart = 0;
    for (let i = 0; i < program.pulses.length; i++) {
      const p = program.pulses[i];
      const gapMs = i === 0 ? Math.max(0, p.delayMs) : Math.max(0, p.delayMs - lastStart);
      const effective = Math.max(1, Math.round(p.durationMs * (0.5 + 0.5 * clamp01(p.intensity))));
      if (i === 0) {
        if (gapMs > 0) pattern.push(gapMs, 0);
      } else {
        pattern.push(gapMs);
      }
      pattern.push(effective);
      lastStart = i === 0 ? p.delayMs : lastStart + p.delayMs;
    }
    if (pattern.length % 2 === 1) pattern.push(0);
    return pattern;
  }
  play(program) {
    if (!this.isSupported() || !this.nav?.vibrate) return false;
    const pattern = this.buildPattern(program);
    if (pattern.length === 0) return false;
    return this.nav.vibrate(pattern);
  }
  cancel() {
    this.nav?.vibrate?.(0);
  }
}

let sessionCounter = 0;

function nextSessionId(prefix = "web") {
  sessionCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${sessionCounter}`;
}

function makeEnvelope(input) {
  const env = { specVersion: TOUCHLANG_SPEC_VERSION, sessionId: input.sessionId };
  if (input.deviceProfile) env.deviceProfile = input.deviceProfile;
  if (input.stream?.length > 0) env.stream = input.stream;
  if (input.gesture) env.gesture = input.gesture;
  if (input.intent) env.intent = input.intent;
  if (input.haptic) env.haptic = input.haptic;
  return env;
}

function envelopeToJsonlLine(envelope) {
  return `${JSON.stringify(envelope)}\n`;
}

function detectDeviceProfile() {
  if (typeof navigator === "undefined") return undefined;
  const ua = navigator.userAgent || "";
  const maxPointers =
    typeof navigator.maxTouchPoints === "number" && navigator.maxTouchPoints > 0
      ? navigator.maxTouchPoints
      : 1;
  return {
    vendor: navigator.vendor || undefined,
    model: ua.slice(0, 120) || undefined,
    os: typeof navigator.platform === "string" ? navigator.platform : undefined,
    maxPointers,
  };
}

export {
  TOUCHLANG_SPEC_VERSION,
  touchSampleFromPointerEvent,
  segmentGestureFromPath,
  swipeDirection,
  evaluateProgram,
  materializeHapticSemantic,
  WebHapticProgramPlayer,
  envelopeToJsonlLine,
  makeEnvelope,
  nextSessionId,
  detectDeviceProfile,
};
