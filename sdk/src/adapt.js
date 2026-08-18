import { getModel } from './models.js';

/**
 * Probe what this runtime can actually do — Hardware-Aware AI starts here.
 */
export async function detectCapabilities() {
  const webgpu = await probeWebGPU();
  const wasm = typeof WebAssembly === 'object';
  const webnn = typeof navigator !== 'undefined' && typeof navigator.ml !== 'undefined';
  const threads = typeof SharedArrayBuffer !== 'undefined';

  return {
    webgpu: webgpu.ok,
    webgpuAdapter: webgpu.adapter,
    wasm,
    webnn,
    threads,
    transformersDevice: webgpu.ok ? 'webgpu' : wasm ? 'wasm' : 'cpu',
  };
}

async function probeWebGPU() {
  if (typeof navigator === 'undefined' || !navigator.gpu) {
    return { ok: false, adapter: null };
  }
  try {
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) return { ok: false, adapter: null };
    const info = adapter.info ?? {};
    return {
      ok: true,
      adapter: info.description || info.device || info.vendor || 'WebGPU adapter',
    };
  } catch {
    return { ok: false, adapter: null };
  }
}

/**
 * Adapt model execution to this machine's real situation.
 * Returns a plan the runtime actually honors (device, dtype, tokens, defer).
 */
export async function adaptExecution(modelId, hw, caps = null) {
  const model = getModel(modelId);
  const a = hw.awareness;
  const thermal = a?.thermal;
  const power = a?.power;
  const capabilities = caps ?? await detectCapabilities();

  const throttle = thermal?.throttleRisk === 'elevated';
  const lowPower = power?.budget?.includes('critical') || power?.budget?.includes('power-save');
  const lowRam = hw.ramGb != null && hw.ramGb <= 4;

  // Prefer real available compute. Never claim CoreML/WebNN unless probed.
  let device = 'wasm';
  let backend = 'ONNX WASM';
  if (capabilities.webgpu) {
    device = 'webgpu';
    backend = `WebGPU${capabilities.webgpuAdapter ? ` · ${capabilities.webgpuAdapter}` : ''}`;
  } else if (capabilities.webnn) {
    device = 'wasm';
    backend = 'WebNN available · WASM path';
  } else if (!capabilities.wasm) {
    device = 'cpu';
    backend = 'CPU fallback';
  }

  let dtype = 'q8';
  if (model.id === 'flash' || lowRam || lowPower) dtype = 'q4';
  if (model.id === 'depth' && hw.ramGb != null && hw.ramGb >= 16 && !throttle && capabilities.webgpu) {
    dtype = 'fp16';
  }

  let maxTokens = model.maxTokens;
  if (throttle) maxTokens = Math.floor(maxTokens * 0.55);
  else if (lowPower) maxTokens = Math.floor(maxTokens * 0.7);
  if (device === 'wasm' && model.id === 'depth') maxTokens = Math.min(maxTokens, 256);

  const shouldDefer = Boolean(
    (lowPower && model.id === 'depth') ||
    (throttle && model.id === 'depth') ||
    (lowRam && model.id === 'depth'),
  );

  const reasons = [];
  reasons.push(`device=${device} (probed)`);
  reasons.push(`dtype=${dtype}`);
  if (throttle) reasons.push('thermal pressure → fewer tokens');
  if (lowPower) reasons.push('power budget → lighter plan');
  if (lowRam) reasons.push('low RAM → q4');
  if (shouldDefer) reasons.push('depth deferred on this machine — use pulse/flash');

  return {
    backend,
    device,
    dtype,
    quant: dtype,
    budget: shouldDefer && model.id === 'depth' ? 'pulse' : model.id,
    mode: shouldDefer && model.id === 'depth' ? getModel('pulse').name : model.name,
    modelId: shouldDefer && model.id === 'depth' ? 'pulse' : model.id,
    maxTokens,
    latencyTarget: device === 'webgpu'
      ? (model.speedWeight > 0.8 ? '<150ms' : 'gpu-balanced')
      : (model.speedWeight > 0.8 ? '<200ms' : 'cpu-balanced'),
    thermal: thermal?.state ?? 'nominal',
    powerBudget: power?.budget ?? 'balanced',
    layers: `${hw.layersActive}/${hw.layersTotal}`,
    shouldDefer,
    capabilities,
    reasons,
  };
}

export function formatAdaptPlan(plan) {
  return `${plan.mode} · ${plan.backend} · ${plan.dtype} · ${plan.maxTokens} tok · ${plan.device}`;
}

/** Can this machine run local hardware-aware inference right now? */
export function canRunLocally(hw, plan) {
  if (!plan) return { ok: false, reason: 'no plan' };
  if (plan.shouldDefer) return { ok: false, reason: plan.reasons?.join('; ') ?? 'deferred' };
  if (plan.device === 'cpu' && !plan.capabilities?.wasm) {
    return { ok: false, reason: 'no WASM / WebGPU' };
  }
  return { ok: true, reason: `ready on ${plan.device}` };
}
