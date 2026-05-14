/**
 * Browser mirror of packages/touch-runtime/src/haptics-materialize.ts and the
 * @touchai/touch-adapter-web Vibration API player. Same IR shape; same semantic names.
 */

function pulse(id, pulses) {
  return { id, pulses };
}

export function materializeHapticSemantic(semantic) {
  if (!semantic || !semantic.kind) return pulse("noop", [{ delayMs: 0, intensity: 0, sharpness: 0, durationMs: 1 }]);
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

function clamp01(n) {
  return Math.min(1, Math.max(0, n));
}

export class WebHapticProgramPlayer {
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
