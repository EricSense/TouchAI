/**
 * TouchAI SDK — hardware-aware AI for developers.
 *
 * Situational intelligence: give every model deep knowledge of the hardware it runs on.
 */

export { SDK_VERSION, HARDWARE_LAYERS } from './layers.js';
export { MODELS, MODEL_ORDER, getModel } from './models.js';
export {
  scanHardware,
  getHardware,
  hardwareSummary,
  formatAwarenessLayer,
} from './hardware.js';
export { adaptExecution, formatAdaptPlan } from './adapt.js';
export { attestIntegrity } from './attest.js';
export {
  generate as runInference,
  generate,
  preloadModel,
  loadModel,
  isModelReady,
  getEngineStatus,
  getNetworkStats,
} from './inference.js';
export {
  recordDeviceVisit,
  recordDeviceQuery,
  getDeviceProfile,
  getMachineMemory,
  situatedSummary,
} from './device-profile.js';
export { MemoryStore } from './memory.js';
export { getAwarenessHistory, recordQuery } from './awareness.js';

import { scanHardware } from './hardware.js';
import { adaptExecution } from './adapt.js';
import { attestIntegrity } from './attest.js';
import { generate } from './inference.js';
import { SDK_VERSION } from './layers.js';

/** Convenience: create a bound SDK client for a single machine session */
export async function createTouchAI(options = {}) {
  const hw = await scanHardware(Boolean(options.forceScan));
  return {
    version: SDK_VERSION,
    hardware: hw,
    scanHardware: (force) => scanHardware(force),
    adaptExecution: (modelId) => adaptExecution(modelId ?? hw.recommendedModel, hw),
    attestIntegrity: () => attestIntegrity(hw),
    runInference: (query, modelId, history = [], ctx = {}) =>
      generate(query, hw, modelId ?? hw.recommendedModel, history, ctx),
  };
}
