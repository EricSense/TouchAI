export {
  segmentGestureFromPath,
  segmentGestureFromStream,
  swipeDirection,
} from "./segment.js";
export { evaluateProgram, gestureEquals, matchPattern } from "./rules.js";
export { materializeHapticSemantic } from "./haptics-materialize.js";
export {
  computeSessionProfile,
  normalizeSamples,
  sessionRelativeVelocity,
  splitStreamByPointer,
} from "./session.js";
