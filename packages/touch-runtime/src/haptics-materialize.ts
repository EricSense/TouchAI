import type { HapticProgram, HapticSemantic } from "@touchai/touch-spec";

function pulse(
  id: string,
  pulses: HapticProgram["pulses"],
): HapticProgram {
  return { id, pulses };
}

/** Map semantic haptics to concrete pulses for host adapters (Core Haptics, Vibrator, web Vibration API). */
export function materializeHapticSemantic(semantic: HapticSemantic): HapticProgram {
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
  }
}
