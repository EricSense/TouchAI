/**
 * TouchAI Runtime SDK — implements RUNTIME_API from focus.js
 */

import { scanHardware as scan } from './hardware.js';
import { getModel } from './models.js';
import { getCategory } from './ecosystem.js';

export { scan as scanHardware };

export function loadVertical(categoryId) {
  return getCategory(categoryId);
}

export function adaptExecution(modelId, hw) {
  const model = getModel(modelId);
  const a = hw.awareness;
  const thermal = a?.thermal;

  let backend = 'ONNX WASM';
  if (hw.npu?.includes('Apple Neural')) backend = 'CoreML · Neural Engine';
  else if (hw.npu?.includes('WebNN')) backend = 'WebNN';
  else if (/Apple|Metal|AMD|NVIDIA/i.test(hw.gpu ?? '')) backend = 'WebGPU';

  let quant = 'q8';
  if (hw.ramGb != null && hw.ramGb <= 4) quant = 'q4';
  if (model.id === 'flash') quant = 'q4';
  if (model.id === 'depth' && hw.ramGb != null && hw.ramGb >= 16) quant = 'fp16';

  const throttle = thermal?.throttleRisk === 'elevated';
  const maxTokens = throttle ? Math.floor(model.maxTokens * 0.6) : model.maxTokens;

  return {
    backend,
    quant,
    budget: model.id,
    mode: model.name,
    maxTokens,
    latencyTarget: model.speedWeight > 0.8 ? '<200ms' : model.depthWeight > 0.8 ? 'depth-first' : 'balanced',
    thermal: thermal?.state ?? 'nominal',
    powerBudget: a?.power?.budget ?? 'balanced',
    layers: `${hw.layersActive}/${hw.layersTotal}`,
  };
}

export async function attestIntegrity(hw) {
  const seed = `${hw.platform}|${hw.arch}|${hw.cores}|${hw.gpu}|${hw.layersActive}`;
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(seed));
  const signature = [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 40);

  return {
    deviceId: btoa(`${hw.platform}-${hw.arch}`).replace(/=+$/, '').slice(0, 16),
    enclave: hw.npu,
    signature,
    layers: hw.layersActive,
    policy: hw.networkPolicy,
    timestamp: new Date().toISOString(),
  };
}

export function formatAdaptPlan(plan) {
  return `${plan.mode} · ${plan.backend} · ${plan.quant} · ${plan.maxTokens} tok · ${plan.latencyTarget}`;
}
