/**
 * TouchAI — what it does, how it works.
 *
 * WHAT: Hardware-aware AI. Gives every AI model deep knowledge of the
 *       physical host it runs on — a relationship with the machine.
 *
 * HOW:  Scan → Adapt → Route → Run → Remember
 */

import { HARDWARE_LAYERS as SDK_LAYERS } from 'touchai-sdk';

export const BRAND = {
  name: 'TouchAI',
  line: 'Hardware-aware AI',
};

/** One sentence: what TouchAI does */
export const WHAT = {
  headline: 'TouchAI makes AI hardware-aware.',
  body: 'It creates a deep relationship between AI models and their physical host machines — so a model knows where it is, what the machine can do right now, and how to run on it.',
  bullets: [
    'Knows the host: silicon, thermal, power, memory, sensors, history, usage',
    'Adapts execution: device path, dtype, and budget for this machine',
    'Routes work: Local, Cloud, or Coding based on live situation',
    'Compounds depth: remembers the machine over time',
  ],
};

/** How TouchAI works — the pipeline */
export const HOW = [
  {
    id: 'scan',
    step: '01',
    title: 'Scan',
    detail: 'Read the host. Eight layers of situation — not a benchmark, a live profile of this machine.',
  },
  {
    id: 'adapt',
    step: '02',
    title: 'Adapt',
    detail: 'Turn situation into a plan: WebGPU/WASM path, dtype, token budget, whether to defer heavy work.',
  },
  {
    id: 'route',
    step: '03',
    title: 'Route',
    detail: 'Pick the right assistant for the job on this host right now — Local, Cloud, or Coding.',
  },
  {
    id: 'run',
    step: '04',
    title: 'Run',
    detail: 'Execute with that plan. The model is no longer homeless — it has a home on this machine.',
  },
  {
    id: 'remember',
    step: '05',
    title: 'Remember',
    detail: 'Store machine memory. Cloud solved scale; TouchAI builds depth on the host you actually use.',
  },
];

export const THESIS = {
  problem:
    'Every AI company positions around capability. Smarter models. Faster responses. More parameters. Better benchmarks. That race ends in commodity.',
  axis: 'TouchAI positions on situational intelligence — not how smart the AI is, but how well it understands where it is.',
  home: 'Today every model is essentially homeless. TouchAI gives AI a home on the machine.',
  depth: 'The cloud solved scale. TouchAI is solving depth.',
};

export const MVP = {
  badge: 'Working prototype',
  ships: [
    'Live host scan (8 layers)',
    'Adapted execution plan',
    'Assistant routing from situation',
    'Situated Agent you can talk to',
    'SDK installable from this repo',
  ],
};

export const HARDWARE_LAYERS = SDK_LAYERS;

export const PRODUCTS = [
  {
    id: 'try',
    view: 'try',
    num: '01',
    title: 'Situated Agent',
    audience: 'Prototype',
    tagline: 'See what TouchAI does on this host',
    what: 'The live prototype. Scan this machine, adapt a plan, route assistants, and talk to an agent that uses that situation.',
    does: 'Scan → Adapt → Route → Run on the browser host you are on right now.',
  },
  {
    id: 'sdk',
    view: 'sdk',
    num: '02',
    title: 'TouchAI SDK',
    audience: 'Developers',
    tagline: 'Put hardware awareness in your app',
    what: 'The developer product. Same pipeline — scan, adapt, route, run — as a library.',
    does: 'createTouchAI() · scanHardware · adaptExecution · recommendAssistant · runInference',
  },
];

export const SDK_API = [
  {
    name: 'scanHardware()',
    pillar: 'scan',
    desc: 'Eight-layer situation profile of the host.',
    code: `const hw = await scanHardware()`,
  },
  {
    name: 'adaptExecution(model, hw)',
    pillar: 'adapt',
    desc: 'Hardware-aware plan: device, dtype, tokens.',
    code: `const plan = await adaptExecution('pulse', hw)`,
  },
  {
    name: 'recommendAssistant(hw, plan, query)',
    pillar: 'route',
    desc: 'Route Local / Cloud / Coding from situation.',
    code: `const route = recommendAssistant(hw, plan, query)`,
  },
  {
    name: 'runInference(…)',
    pillar: 'run',
    desc: 'Generate on the adapted path.',
    code: `const { response, plan, route } = await runInference(q, hw)`,
  },
];

export const PILLARS = [
  { id: 'situation', label: 'Scan', desc: WHAT.bullets[0] },
  { id: 'adaptation', label: 'Adapt & route', desc: 'Plan and assistant choice follow the host.' },
  { id: 'deployment', label: 'Run & remember', desc: 'Situated execution with machine memory.' },
];

export const FLOW = HOW.map((h) => h.title);

export const JOURNEY = [
  { step: 1, view: 'home', title: 'What & How', desc: 'Product' },
  { step: 2, view: 'try', title: 'Try', desc: 'Prototype' },
  { step: 3, view: 'sdk', title: 'SDK', desc: 'Build' },
];

export const VIEW_FOCUS = {
  home: { label: 'What · How · TouchAI', checks: ['situation', 'deployment'] },
  try: { label: 'Try · Situated Agent', checks: ['situation', 'adaptation', 'deployment'] },
  sdk: { label: 'SDK · build with it', checks: ['situation', 'adaptation', 'deployment'] },
  device: { label: 'Try · Situated Agent', checks: ['situation', 'adaptation', 'deployment'] },
};

export function focusLine(hw) {
  const machine = hw ? `${hw.platform} · ${hw.cores ?? '?'} cores` : 'your host';
  const layers = hw?.layersActive ? `${hw.layersActive}/${hw.layersTotal} layers · ` : '';
  return `${layers}TouchAI on ${machine}`;
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
  if (id === 'situation') return hw.layersActive === hw.layersTotal;
  if (id === 'adaptation') return Boolean(hw.recommendedModel && hw.awareness);
  return true;
}

export function focusScore(view, hw) {
  const items = assessFocus(view, hw);
  const active = items.filter((i) => i.active).length;
  return { active, total: items.length, complete: active === items.length };
}
