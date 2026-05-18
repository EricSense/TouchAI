/**
 * Single browser entry re-exporting compiled package outputs for the static playground.
 * Imports dist/ subpaths directly (avoids Node-only jsonl-node in the dataset barrel).
 */
export { TOUCHLANG_SPEC_VERSION } from "../packages/touch-spec/dist/version.js";
export {
  segmentGestureFromPath,
  swipeDirection,
  evaluateProgram,
  materializeHapticSemantic,
} from "../packages/touch-runtime/dist/index.js";
export { touchSampleFromPointerEvent, WebHapticProgramPlayer } from "../packages/touch-adapter-web/dist/index.js";
export { envelopeToJsonlLine } from "../packages/touch-dataset/dist/jsonl-core.js";
export { makeEnvelope, nextSessionId, detectDeviceProfile } from "../packages/touch-dataset/dist/envelope-client.js";
