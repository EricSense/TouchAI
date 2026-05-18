/**
 * Single browser entry re-exporting the canonical npm packages for the static playground.
 * Bundled to public/touchai/runtime.mjs via `npm run build:playground`.
 */
export { TOUCHLANG_SPEC_VERSION } from "@touchai/touch-spec";
export {
  segmentGestureFromPath,
  swipeDirection,
  evaluateProgram,
  materializeHapticSemantic,
} from "@touchai/touch-runtime";
export { touchSampleFromPointerEvent, WebHapticProgramPlayer } from "@touchai/touch-adapter-web";
export {
  envelopeToJsonlLine,
  makeEnvelope,
  nextSessionId,
  detectDeviceProfile,
} from "@touchai/touch-dataset";
