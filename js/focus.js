/**
 * TouchAI — product source of truth.
 * Hardware-aware AI. Situational intelligence.
 * Infrastructure for a deep relationship between AI models and their host machines.
 */

import { HARDWARE_LAYERS as SDK_LAYERS } from 'touchai-sdk';

export const BRAND = {
  name: 'TouchAI',
  line: 'Hardware-aware AI',
  thesis: 'Situational intelligence',
  company: 'TouchAI is the company building the infrastructure for hardware-intelligent AI.',
};

export const THESIS = {
  opening:
    'TouchAI creates a deep relationship between AI models and their physical host machines. By making AI hardware-intelligent, we unlock critical capabilities — and TouchAI builds the infrastructure for it.',
  problem:
    'Every AI company positions around capability. Smarter models. Faster responses. More parameters. Better benchmarks.',
  destination:
    'That race has one destination — a commodity. When every model is smart enough, smart enough stops being a differentiator.',
  refusal: "TouchAI doesn't play that game.",
  axis:
    'TouchAI positions around a different axis entirely: situational intelligence.',
  question:
    'Not how smart is the AI — but how well does the AI understand where it is.',
  promise:
    'TouchAI is building Hardware-aware AI that gives every AI model deep knowledge of the hardware it runs on.',
};

export const HOME = {
  homeless:
    'Right now, every AI model is essentially homeless. It gets deployed wherever and has no real relationship with that environment. It doesn\'t know what it\'s capable of on the machine, right now.',
  home:
    'TouchAI is essentially giving AI a home — a lasting relationship with the physical host it runs on.',
  scale:
    'The cloud solved scale. TouchAI is solving depth.',
  depth:
    'AI that knows your hardware starts to build a model of how you use that machine. That changes everything — and makes TouchAI possible.',
};

export const MARKET = {
  opening:
    'As foundation models commoditize, value shifts to the layer around them — deployment. The infrastructure that situates models on real machines.',
  position:
    'TouchAI is building that infrastructure: Hardware-aware AI for every model, on every host.',
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
    tagline: 'Give any model a relationship with its host',
    what: 'The developer product — infrastructure to integrate hardware awareness into applications so models know the machine they land on.',
    does: 'Scan the host, probe capabilities, adapt execution. The first step from homeless deployment to a situated model.',
  },
  {
    id: 'device',
    view: 'device',
    num: '02',
    title: 'TouchAI Device',
    audience: 'Consumer & prosumer',
    tagline: 'The Situated Agent — AI that lives here',
    what: 'An agent that lives on your specific machine and develops a genuine understanding of it over time — hardware, usage, and context no cloud model can acquire.',
    does: 'The intelligence that manages all assistants from a home on this device.',
    arc: 'As the situated agent learns more about the machine and how you use it, it becomes the most capable AI interface on that device — not because it is the smartest model, but because it has depth: a relationship with this host.',
  },
];

export const PILLARS = [
  {
    id: 'situation',
    label: 'Situational intelligence',
    desc: 'Know where the model runs — silicon, thermal, power, memory, sensors, history, and how you use the machine.',
  },
  {
    id: 'adaptation',
    label: 'Hardware-aware execution',
    desc: 'Device path, dtype, and budget adapt to the host underneath — for every model.',
  },
  {
    id: 'deployment',
    label: 'Depth infrastructure',
    desc: 'Cloud solved scale. TouchAI is the infrastructure for depth — models that are home on real hardware.',
  },
];

export const SDK_API = [
  {
    name: 'scanHardware()',
    pillar: 'situation',
    desc: 'Eight-layer situation profile of the host machine.',
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
  'Knows its host',
  'Runtime adapts',
  'Situated inference',
  'Depth compounds',
];

export const JOURNEY = [
  { step: 1, view: 'home', title: 'Home', desc: 'Hardware-aware AI thesis' },
  { step: 2, view: 'sdk', title: 'SDK', desc: 'Infrastructure for developers' },
  { step: 3, view: 'device', title: 'Device', desc: 'Situated Agent' },
];

export const VIEW_FOCUS = {
  home: { label: 'Home · Hardware-aware AI', checks: ['situation', 'deployment'] },
  sdk: { label: 'SDK · hardware-aware infrastructure', checks: ['situation', 'adaptation', 'deployment'] },
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
