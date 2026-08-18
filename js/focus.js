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
    'TouchAI is building Hardware-aware AI that gives every AI model deep knowledge of the hardware it runs on.',
};

export const MARKET = {
  opening:
    'The models are creating an opening. As foundation models commoditize, the value shifts to the layer around them — deployment.',
  position: 'TouchAI is positioned exactly at that inflection point.',
};

export const HARDWARE_LAYERS = SDK_LAYERS;

/** Exact product roadmap */
export const PRODUCTS = [
  {
    id: 'sdk',
    view: 'sdk',
    num: '01',
    title: 'TouchAI SDK',
    audience: 'Developers',
    tagline: 'Hardware awareness into every application',
    what: 'The developer-facing product. The interface through which AI developers integrate hardware awareness into their applications.',
    does: 'Scan the machine, probe capabilities, adapt execution — so any model knows the silicon it lands on.',
  },
  {
    id: 'device',
    view: 'device',
    num: '02',
    title: 'TouchAI Device',
    audience: 'Consumer & prosumer',
    tagline: 'The Situated Agent',
    what: 'An AI agent that lives on your specific machine and develops a genuine understanding of it over time.',
    does: 'The intelligence that manages all assistants.',
    arc: 'As the situated agent learns more about the machine and the user\'s patterns, it becomes the most capable AI interface on that device — not because it\'s the smartest model, but because it has context no cloud model can acquire.',
  },
];

export const PILLARS = [
  {
    id: 'situation',
    label: 'Situational intelligence',
    desc: 'Know where the model runs — silicon, thermal, power, memory, sensors, history, and user context.',
  },
  {
    id: 'adaptation',
    label: 'Hardware-aware execution',
    desc: 'Device path, dtype, and budget adapt to the machine underneath — for every model.',
  },
  {
    id: 'deployment',
    label: 'The deployment layer',
    desc: 'As models commoditize, value concentrates in the layer that situates them on real hardware.',
  },
];

export const SDK_API = [
  {
    name: 'scanHardware()',
    pillar: 'situation',
    desc: 'Eight-layer situation profile of the machine.',
    code: `const hw = await scanHardware()`,
  },
  {
    name: 'detectCapabilities()',
    pillar: 'adaptation',
    desc: 'Probe WebGPU / WASM / WebNN on this runtime.',
    code: `const caps = await detectCapabilities()`,
  },
  {
    name: 'adaptExecution(model, hw)',
    pillar: 'adaptation',
    desc: 'Hardware-aware plan any model can run under.',
    code: `const plan = await adaptExecution('pulse', hw)\n// device, dtype, tokens, reasons`,
  },
  {
    name: 'runInference(…)',
    pillar: 'adaptation',
    desc: 'Execute on the adapted path (honors the plan).',
    code: `const { response, plan } = await runInference(q, hw, 'pulse')`,
  },
];

export const FLOW = [
  'Model arrives',
  'Hardware scan',
  'Runtime adapts',
  'Situated inference',
  'Machine-specific output',
];

export const JOURNEY = [
  { step: 1, view: 'home', title: 'Home', desc: 'Hardware-aware AI thesis' },
  { step: 2, view: 'sdk', title: 'SDK', desc: 'For developers' },
  { step: 3, view: 'device', title: 'Device', desc: 'Situated Agent' },
];

export const VIEW_FOCUS = {
  home: { label: 'Home · Hardware-aware AI', checks: ['situation', 'deployment'] },
  sdk: { label: 'SDK · developer product', checks: ['situation', 'adaptation', 'deployment'] },
  device: { label: 'Device · Situated Agent', checks: ['situation', 'adaptation', 'deployment'] },
};

export function focusLine(hw) {
  const machine = hw ? `${hw.platform} · ${hw.cores ?? '?'} cores` : 'your device';
  const layers = hw?.layersActive ? `${hw.layersActive}/${hw.layersTotal} layers · ` : '';
  return `${layers}hardware-aware on ${machine}`;
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
