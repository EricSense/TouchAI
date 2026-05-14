/**
 * Browser-side mirror of @touchai/touch-spec.
 *
 * Pure data + constants — kept in lockstep with packages/touch-spec/src/version.ts.
 * No build step required so this loads directly on Vercel static hosting.
 */

export const TOUCHLANG_SPEC_VERSION = "0.1.0";

export const TOUCH_PHASES = Object.freeze(["began", "moved", "ended", "cancelled"]);

export const HAPTIC_SEMANTIC_KINDS = Object.freeze([
  "ack_light",
  "ack_medium",
  "ack_heavy",
  "confirm_success",
  "confirm_warning",
  "confirm_error",
  "understood",
  "clarify",
  "custom",
]);

export const GESTURE_KINDS = Object.freeze(["tap", "long_press", "swipe", "pan"]);
