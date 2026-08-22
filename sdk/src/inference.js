/**
 * TouchAI inference — situation-first replies.
 * Hardware-aware routing and answers grounded in the live host plan.
 * Optional local model loading is available but not required.
 */

import { adaptExecution, detectCapabilities } from './adapt.js';
import { attestIntegrity } from './attest.js';
import { getModel } from './models.js';
import { recordQuery } from './awareness.js';
import { recordDeviceQuery } from './device-profile.js';
import { recommendAssistant, formatRouteDecision } from './route.js';

let pipeline = null;
let loading = false;
let runtimeDevice = null;

export function getNetworkStats() {
  return { bytesSent: 0, serverCalls: 0, policy: 'hardware-local' };
}

export function getEngineStatus() {
  return {
    runtime: 'TouchAI',
    device: runtimeDevice ?? 'situation-engine',
    ready: true,
    loaded: Boolean(pipeline),
    loading,
  };
}

export function isModelReady() {
  return Boolean(pipeline);
}

async function answer(query, hw, model, plan) {
  const route = recommendAssistant(hw, plan, query);
  const q = query.toLowerCase().trim();
  const a = hw.awareness;

  if (/^(hi|hello|hey)\b/.test(q)) {
    return `TouchAI is online on ${hw.platform}. ${hw.layersActive}/8 layers scanned. Default route: ${route.name} via ${plan.device}/${plan.dtype}.`;
  }
  if (/what (does|is) touchai|who are you|what are you/.test(q)) {
    return [
      'TouchAI makes AI hardware-aware.',
      'It gives every model a relationship with its physical host — situational intelligence, not smarter benchmarks.',
      `On this machine: ${hw.platform} · ${plan.device}/${plan.dtype} · route ${route.name}.`,
    ].join('\n');
  }
  if (/how (does|do) (touchai|you|it) work|how it works|pipeline/.test(q)) {
    return [
      'How TouchAI works:',
      '1 Scan — read this host (8 layers)',
      '2 Adapt — pick device, dtype, budget',
      '3 Route — Local / Cloud / Coding',
      '4 Run — execute with that plan',
      '5 Remember — machine memory for depth',
      `Right now: ${plan.device}/${plan.dtype}, route ${route.name}.`,
    ].join('\n');
  }
  if (/deploy|anywhere|anytime|docker|vercel|hosting|ship/.test(q)) {
    return [
      'TouchAI deploys anywhere, anytime.',
      'Static · Docker · Vercel · Netlify · Render · Fly · any Node host · embed the SDK.',
      'npm run build && npm start',
      'docker compose up --build',
      `This runtime: ${hw.runtime ?? 'host'} · ${hw.platform} · ${plan.device}/${plan.dtype}.`,
    ].join('\n');
  }
  if (/route|which assistant|heavy|should handle|prefer|local(ly)?|coding task|next task/.test(q)) {
    return `Routing on this host:\n${formatRouteDecision(route)}`;
  }
  if (/adapt|plan|dtype|webgpu|wasm|execution/.test(q)) {
    return [
      `Adapt plan for ${hw.platform}:`,
      `${plan.device} · ${plan.dtype} · ${plan.maxTokens} tok · defer=${plan.shouldDefer}`,
      ...(plan.reasons ?? []).map((r) => `· ${r}`),
    ].join('\n');
  }
  if (/hardware|situation|spec|machine|host|layer|scan|cpu|gpu|ram/.test(q)) {
    return [
      'Host situation:',
      `Silicon · ${a.silicon.platform} ${a.silicon.arch} · ${a.silicon.cores} · ${a.silicon.gpu}`,
      `Thermal · ${a.thermal.state}`,
      `Power · ${a.power.level} · ${a.power.budget}`,
      `Memory · ${a.memory.ram}`,
      `Adapt · ${plan.device}/${plan.dtype}`,
      `Route · ${route.name}`,
    ].join('\n');
  }
  if (/attest|integrity|proof/.test(q)) {
    const proof = await attestIntegrity(hw);
    return `Hardware-rooted proof\nDevice ${proof.deviceId}\nSig ${proof.signature}`;
  }

  return [
    `TouchAI on ${hw.platform} · ${plan.device}/${plan.dtype} · ${model.name}`,
    `Route: ${route.name}. Thermal ${a.thermal.state}. Power ${a.power.level}.`,
    'Ask: what does TouchAI do · how does it work · route a heavy job · what is my hardware situation',
  ].join('\n');
}

export async function generate(query, hardware, modelId, history = [], ctx = {}) {
  const plan = await adaptExecution(modelId, hardware);
  const model = getModel(plan.modelId ?? modelId);
  const start = performance.now();
  const response = await answer(query, hardware, model, plan);
  const latency = performance.now() - start;
  const tokens = Math.ceil(response.length / 4);
  recordQuery(latency, model.id);
  try { recordDeviceQuery(hardware, model.id, latency); } catch { /* ignore */ }

  return {
    response,
    latency,
    tokens,
    network: getNetworkStats(),
    engine: 'touchai-situation',
    plan,
    route: recommendAssistant(hardware, plan, query),
    ctx,
  };
}

export const runInference = generate;

export async function loadModel() {
  loading = false;
  pipeline = null;
  runtimeDevice = 'situation-engine';
  return null;
}

export function preloadModel(_modelId, onProgress) {
  onProgress?.('TouchAI situation engine ready');
  runtimeDevice = 'situation-engine';
  return Promise.resolve(true);
}

export async function detectAndAdapt(modelId, hw) {
  const caps = await detectCapabilities();
  return adaptExecution(modelId, hw, caps);
}
