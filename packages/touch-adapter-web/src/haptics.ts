import type { HapticProgram, HapticPulse } from "@touchai/touch-spec";

interface VibrationCapableNavigator {
  vibrate?: (pattern: number | number[]) => boolean;
}

/**
 * Web `HapticProgram` player using the Vibration API.
 *
 * The Vibration API has no concept of intensity or sharpness; we synthesize the program by
 * (a) flattening pulses into a `[on, off, on, off, ...]` pattern where each `on` slot is
 * scaled by the pulse's effective intensity (intensity * (0.5 + 0.5 * sharpness)) so transient,
 * high-sharpness pulses feel proportionally crisper than long, dull ones, and
 * (b) the `off` slot before each pulse is `delayMs` relative to the previous pulse start.
 *
 * Falls back to a no-op when the API is unavailable (desktop browsers, iOS Safari).
 */
export class WebHapticProgramPlayer {
  private readonly navigatorRef: VibrationCapableNavigator | null;

  constructor(navigatorImpl: VibrationCapableNavigator | null = typeof navigator !== "undefined" ? navigator : null) {
    this.navigatorRef = navigatorImpl;
  }

  isSupported(): boolean {
    return typeof this.navigatorRef?.vibrate === "function";
  }

  /** Builds the `[on, off, ...]` pattern; exported for tests and inspection. */
  buildPattern(program: HapticProgram): number[] {
    const pattern: number[] = [];
    let lastStart = 0;
    for (let i = 0; i < program.pulses.length; i++) {
      const p = program.pulses[i] as HapticPulse;
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

  /** Plays the program. Returns `true` if the platform accepted the request. */
  play(program: HapticProgram): boolean {
    if (!this.isSupported() || !this.navigatorRef?.vibrate) return false;
    const pattern = this.buildPattern(program);
    if (pattern.length === 0) return false;
    return this.navigatorRef.vibrate(pattern);
  }

  cancel(): void {
    this.navigatorRef?.vibrate?.(0);
  }
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}
