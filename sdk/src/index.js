/**
 * TouchAI SDK — Hardware-Aware AI for developers.
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
export {
  adaptExecution,
  detectCapabilities,
  formatAdaptPlan,
  canRunLocally,
} from './adapt.js';
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
import { adaptExecution, detectCapabilities, canRunLocally } from './adapt.js';
import { attestIntegrity } from './attest.js';
import { generate } from './inference.js';
import { SDK_VERSION } from './layers.js';

/** Bound Hardware-Aware AI client for one machine session */
export async function createTouchAI(options = {}) {
  const hw = await scanHardware(Boolean(options.forceScan));
  const capabilities = await detectCapabilities();
  const plan = await adaptExecution(options.modelId ?? hw.recommendedModel, hw, capabilities);

  return {
    version: SDK_VERSION,
    product: 'Hardware-Aware AI',
    hardware: hw,
    capabilities,
    plan,
    canRun: canRunLocally(hw, plan),
    scanHardware: (force) => scanHardware(force),
    detectCapabilities,
    adaptExecution: async (modelId) => adaptExecution(modelId ?? hw.recommendedModel, hw),
    attestIntegrity: () => attestIntegrity(hw),
    runInference: (query, modelId, history = [], ctx = {}) =>
      generate(query, hw, modelId ?? plan.modelId ?? hw.recommendedModel, history, ctx),
  };
}
