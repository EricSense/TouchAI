/**
 * TouchAI SDK — Hardware-aware AI for developers.
 *
 * Infrastructure for a deep relationship between AI models and their physical host machines.
 * Situational intelligence: every model knows the hardware it runs on.
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
export { recommendAssistant, formatRouteDecision } from './route.js';
export { deployManifest, deployCommands, DEPLOY_TARGETS } from './deploy.js';
export { runtimeId, isBrowser, isNode } from './env.js';
export { MemoryStore } from './memory.js';
export { getAwarenessHistory, recordQuery } from './awareness.js';

import { scanHardware } from './hardware.js';
import { adaptExecution, detectCapabilities, canRunLocally } from './adapt.js';
import { attestIntegrity } from './attest.js';
import { generate } from './inference.js';
import { recommendAssistant } from './route.js';
import { deployManifest } from './deploy.js';
import { runtimeId } from './env.js';
import { SDK_VERSION } from './layers.js';

/** Bound Hardware-Aware AI client — works on any host, anytime */
export async function createTouchAI(options = {}) {
  const hw = await scanHardware(Boolean(options.forceScan));
  const capabilities = await detectCapabilities();
  const plan = await adaptExecution(options.modelId ?? hw.recommendedModel, hw, capabilities);
  const route = recommendAssistant(hw, plan);

  return {
    version: SDK_VERSION,
    product: 'Hardware-Aware AI',
    runtime: runtimeId(),
    hardware: hw,
    capabilities,
    plan,
    route,
    canRun: canRunLocally(hw, plan),
    deploy: deployManifest(hw, plan),
    scanHardware: (force) => scanHardware(force),
    detectCapabilities,
    adaptExecution: async (modelId) => adaptExecution(modelId ?? hw.recommendedModel, hw),
    recommendAssistant: (query, modelId) =>
      adaptExecution(modelId ?? hw.recommendedModel, hw).then((p) => recommendAssistant(hw, p, query)),
    attestIntegrity: () => attestIntegrity(hw),
    runInference: (query, modelId, history = [], ctx = {}) =>
      generate(query, hw, modelId ?? plan.modelId ?? hw.recommendedModel, history, ctx),
  };
}
