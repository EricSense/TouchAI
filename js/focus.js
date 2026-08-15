/**
 * TouchAI — product source of truth.
 * Hardware-aware AI. Situational intelligence.
 */

import { HARDWARE_LAYERS as SDK_LAYERS } from 'touchai-sdk';

export const BRAND = {
  name: 'TouchAI',
  line: 'Hardware-aware AI',
  thesis: 'Situational intelligence',
};

export const THESIS = {
  problem:
    'Every AI company positions around capability. Smarter models. Faster responses. More parameters. Better benchmarks.',
  destination:
    'That race has one destination — commodity. When every model is smart enough, smart enough stops being a differentiator.',
  refusal: "TouchAI doesn't play that game.",
  axis:
    'TouchAI positions around a different axis entirely: situational intelligence.',
  question:
    'Not how smart is the AI — but how well does the AI understand where it is.',
  promise:
    'TouchAI is building hardware-aware AI that gives every AI model deep knowledge of the hardware it runs on.',
};

export const MARKET = {
  opening:
    'The models are creating an opening. As foundation models commoditize, the value shifts to the layer around them — deployment.',
  position: 'TouchAI is positioned exactly at that inflection point.',
};

/** Eight layers of situational awareness on a machine */
export const HARDWARE_LAYERS = SDK_LAYERS;

/** Product roadmap — two surfaces */
export const PRODUCTS = [
  {
    id: 'sdk',
    view: 'sdk',
    num: '01',
    title: 'TouchAI SDK',
    audience: 'Developers',
    tagline: 'Hardware-Aware AI for every application',
    what: 'The developer-facing product. Integrate hardware awareness into your AI apps.',
    does: 'Scan silicon, probe capabilities, adapt execution, run inference that knows the machine.',
  },
  {
    id: 'device',
    view: 'use',
    num: '02',
    title: 'TouchAI Device',
    audience: 'Anyone on a machine',
    tagline: 'Hardware-Aware AI you open and use',
    what: 'The product that runs on your specific machine and understands it over time.',
    does: 'Live 8-layer situation + adapted inference — context no cloud model can acquire.',
    arc: 'As it learns more about the machine and your patterns, it becomes the most capable interface on that device — not because it is the smartest model, but because it is hardware-aware.',
  },
];

export const PILLARS = [
  {
    id: 'situation',
    label: 'Situational intelligence',
    desc: 'Know where the model runs — silicon, thermal, power, memory, sensors, history, and user context — not just that it “runs on device.”',
  },
  {
    id: 'adaptation',
    label: 'Hardware-aware execution',
    desc: 'Backend, quantization, token budget, and latency targets adapt in real time to the machine underneath.',
  },
  {
    id: 'deployment',
    label: 'The deployment layer',
    desc: 'As models commoditize, value concentrates in the layer that situates them. TouchAI owns that layer.',
  },
];

export const SDK_API = [
  {
    name: 'createTouchAI()',
    pillar: 'deployment',
    desc: 'Bound Hardware-Aware AI client — scan, probe capabilities, adapt, infer, attest.',
    code: `const touch = await createTouchAI();\nconst plan = await touch.adaptExecution('pulse');\n// plan.device is webgpu|wasm — runtime honors it`,
  },
  {
    name: 'scanHardware()',
    pillar: 'situation',
    desc: 'Full hardware profile — silicon, memory, sensors, form factor, and live awareness layers.',
    code: `const hw = await scanHardware();\n// → { platform, arch, cores, gpu, npu, layers… }`,
  },
  {
    name: 'detectCapabilities()',
    pillar: 'adaptation',
    desc: 'Probe WebGPU / WASM / WebNN — real availability, not guesses.',
    code: `const caps = await detectCapabilities();\n// → { webgpu, wasm, webnn, transformersDevice }`,
  },
  {
    name: 'adaptExecution(model, hw)',
    pillar: 'adaptation',
    desc: 'Select device, dtype, token budget for this machine — honored by runInference.',
    code: `const plan = await adaptExecution(model, hw);\n// → { device, dtype, maxTokens, shouldDefer, reasons }`,
  },
  {
    name: 'runInference(query, …)',
    pillar: 'adaptation',
    desc: 'Hardware-aware generation on the adapted device path.',
    code: `const { response, plan } = await runInference(\n  query, hw, model, history\n);`,
  },
  {
    name: 'attestIntegrity()',
    pillar: 'deployment',
    desc: 'Hardware-rooted attestation — prove where inference ran.',
    code: `const proof = await attestIntegrity(hw);\n// → { deviceId, enclave, signature }`,
  },
];

/** @deprecated alias — runtime-api and older imports */
export const RUNTIME_API = SDK_API;

export const FLOW = [
  'Model arrives',
  'Hardware scan',
  'Runtime adapts',
  'Situated inference',
  'Machine-specific output',
];

export const JOURNEY = [
  { step: 1, view: 'use', title: 'Use', desc: 'Hardware-Aware AI on this machine' },
  { step: 2, view: 'sdk', title: 'SDK', desc: 'Integrate hardware awareness' },
  { step: 3, view: 'why', title: 'Why', desc: 'Situational intelligence thesis' },
];

export const VIEW_FOCUS = {
  use: { label: 'Use · Hardware-Aware AI', checks: ['situation', 'adaptation', 'deployment'] },
  sdk: { label: 'SDK · developer interface', checks: ['situation', 'adaptation', 'deployment'] },
  why: { label: 'Why · situational intelligence', checks: ['situation', 'deployment'] },
  // legacy aliases
  live: { label: 'Use · Hardware-Aware AI', checks: ['situation', 'adaptation', 'deployment'] },
  device: { label: 'Use · Hardware-Aware AI', checks: ['situation', 'adaptation'] },
  vision: { label: 'Why · situational intelligence', checks: ['situation', 'deployment'] },
};

export function focusLine(hw) {
  const machine = hw ? `${hw.platform} · ${hw.cores ?? '?'} cores` : 'your device';
  const layers = hw?.layersActive ? `${hw.layersActive}/${hw.layersTotal} layers · ` : '';
  return `${layers}situational intelligence on ${machine}`;
}

export function getViewLabel(view) {
  return VIEW_FOCUS[view]?.label ?? view;
}

export function getProduct(id) {
  return PRODUCTS.find((p) => p.id === id) ?? null;
}

export function getPillar(id) {
  return PILLARS.find((p) => p.id === id) ?? null;
}

export function assessFocus(view, hw) {
  const checks = VIEW_FOCUS[view]?.checks ?? PILLARS.map((p) => p.id);
  return PILLARS.filter((p) => checks.includes(p.id)).map((p) => ({
    ...p,
    active: pillarActive(p.id, hw),
  }));
}

function pillarActive(id, hw) {
  if (!hw) return id === 'deployment';
  switch (id) {
    case 'situation':
      return hw.layersActive === hw.layersTotal;
    case 'adaptation':
      return Boolean(hw.recommendedModel && hw.awareness);
    case 'deployment':
      return true;
    default:
      return false;
  }
}

export function focusScore(view, hw) {
  const items = assessFocus(view, hw);
  const active = items.filter((i) => i.active).length;
  return { active, total: items.length, complete: active === items.length };
}
