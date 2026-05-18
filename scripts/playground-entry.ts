/**
 * Single browser entry re-exporting compiled package outputs for the static playground.
 */
export { TOUCHLANG_SPEC_VERSION } from "../packages/touch-spec/dist/version.js";
export {
  segmentGestureFromPath,
  segmentGestureFromStream,
  swipeDirection,
  computeSessionProfile,
  evaluateProgram,
  materializeHapticSemantic,
} from "../packages/touch-runtime/dist/index.js";
export { touchSampleFromPointerEvent, WebHapticProgramPlayer } from "../packages/touch-adapter-web/dist/index.js";
export { envelopeToJsonlLine } from "../packages/touch-dataset/dist/jsonl-core.js";
export { makeEnvelope, nextSessionId, detectDeviceProfile } from "../packages/touch-dataset/dist/envelope-client.js";
export { resolveTouchBridge } from "../packages/touch-ai-bridge/dist/index.js";
