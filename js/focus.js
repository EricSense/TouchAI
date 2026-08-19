/**
 * TouchAI — startup product source of truth.
 * Hardware-aware AI. Situational intelligence.
 * MVP: situate a model on this host + Situated Agent prototype.
 */

import { HARDWARE_LAYERS as SDK_LAYERS } from 'touchai-sdk';

export const BRAND = {
  name: 'TouchAI',
  line: 'Hardware-aware AI',
  thesis: 'Situational intelligence',
  company: 'TouchAI builds the infrastructure for hardware-intelligent AI.',
};

export const MVP = {
  badge: 'MVP prototype',
  ships: [
    'Live 8-layer hardware scan of this host',
    'Adapted execution plan (device / dtype / budget)',
    'Situated Agent that routes with machine context',
    'Developer SDK you can install from this repo',
  ],
  notYet: [
    'Published npm package (install from repo for now)',
    'Native desktop agent binary',
    'Multi-device fleet orchestration',
  ],
};

export const THESIS = {
  opening:
    'TouchAI creates a deep relationship between AI models and their physical host machines.',
  problem:
    'Every AI company positions around capability. Smarter models. Faster responses. More parameters. Better benchmarks.',
  destination:
    'That race ends in commodity. When every model is smart enough, smart enough stops being a differentiator.',
  refusal: "TouchAI doesn't play that game.",
  axis: 'We position on situational intelligence — not how smart the AI is, but how well it understands where it is.',
  promise:
    'Hardware-aware AI that gives every model deep knowledge of the hardware it runs on.',
  home: 'Models today are homeless. TouchAI gives AI a home on the machine.',
  depth: 'The cloud solved scale. TouchAI is solving depth.',
};

export const HARDWARE_LAYERS = SDK_LAYERS;

export const PRODUCTS = [
  {
    id: 'try',
    view: 'try',
    num: '01',
    title: 'Situated Agent',
    audience: 'MVP prototype',
    tagline: 'AI that lives on this host',
    what: 'The working prototype. An agent grounded in this machine’s situation — silicon, power, thermal, history — that routes work with context no cloud model has.',
    does: 'Scan → adapt → talk. Use it on this browser host right now.',
  },
  {
    id: 'sdk',
    view: 'sdk',
    num: '02',
    title: 'TouchAI SDK',
    audience: 'Developers',
    tagline: 'Hardware awareness for any app',
    what: 'The developer product. Integrate situational intelligence so any model knows the host it lands on.',
    does: 'scanHardware · detectCapabilities · adaptExecution · runInference',
  },
];

export const PILLARS = [
  {
    id: 'situation',
    label: 'Situational intelligence',
    desc: 'Know where the model runs — silicon, thermal, power, memory, sensors, history, usage.',
  },
  {
    id: 'adaptation',
    label: 'Hardware-aware execution',
    desc: 'Device path, dtype, and budget adapt to the host underneath.',
  },
  {
    id: 'deployment',
    label: 'Depth infrastructure',
    desc: 'Cloud solved scale. TouchAI is infrastructure for depth on real machines.',
  },
];

export const SDK_API = [
  {
    name: 'scanHardware()',
    pillar: 'situation',
    desc: 'Eight-layer situation profile of the host.',
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
  'Scan host',
  'Adapt plan',
  'Run situated',
  'Remember machine',
];

export const JOURNEY = [
  { step: 1, view: 'home', title: 'Product', desc: 'Hardware-aware AI' },
  { step: 2, view: 'try', title: 'Try MVP', desc: 'Situated Agent' },
  { step: 3, view: 'sdk', title: 'SDK', desc: 'Get started' },
];

export const VIEW_FOCUS = {
  home: { label: 'Product · Hardware-aware AI', checks: ['situation', 'deployment'] },
  try: { label: 'Try MVP · Situated Agent', checks: ['situation', 'adaptation', 'deployment'] },
  sdk: { label: 'SDK · get started', checks: ['situation', 'adaptation', 'deployment'] },
  // aliases kept for focus checks
  device: { label: 'Try MVP · Situated Agent', checks: ['situation', 'adaptation', 'deployment'] },
};

export function focusLine(hw) {
  const machine = hw ? `${hw.platform} · ${hw.cores ?? '?'} cores` : 'your host';
  const layers = hw?.layersActive ? `${hw.layersActive}/${hw.layersTotal} layers · ` : '';
  return `${layers}MVP live on ${machine}`;
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
  const key = view === 'device' ? 'try' : view;
  const checks = VIEW_FOCUS[key]?.checks ?? PILLARS.map((p) => p.id);
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
