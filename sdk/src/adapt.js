import { getModel } from './models.js';

/**
 * Select quantization, backend, token budget, and latency tier for this machine.
 */
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

export function formatAdaptPlan(plan) {
  return `${plan.mode} · ${plan.backend} · ${plan.quant} · ${plan.maxTokens} tok · ${plan.latencyTarget}`;
}
