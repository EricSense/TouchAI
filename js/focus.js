/**
 * TouchAI — product source of truth.
 * Hardware-aware AI. Situational intelligence.
 */

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
export const HARDWARE_LAYERS = [
  { layer: 'Silicon', knows: 'Chip architecture, cores, instruction sets, GPU/NPU availability' },
  { layer: 'Thermal', knows: 'Temperature state, throttling thresholds, cooling headroom' },
  { layer: 'Power', knows: 'Battery level, charge state, power draw budget' },
  { layer: 'Memory', knows: 'RAM available, bandwidth, cache topology' },
  { layer: 'Sensors', knows: 'Camera, mic, GPS, accelerometer, biometrics — present and active' },
  { layer: 'Peripherals', knows: "What's connected, what can extend capability" },
  { layer: 'History', knows: 'Performance fingerprint of this specific machine over time' },
  { layer: 'User', knows: 'Workload rhythms, usage patterns, behavioral signatures' },
];

/** Product roadmap — two surfaces */
export const PRODUCTS = [
  {
    id: 'sdk',
    view: 'sdk',
    num: '01',
    title: 'TouchAI SDK',
    audience: 'Developers',
    tagline: 'Hardware awareness for every application',
    what: 'The developer-facing product. The interface through which AI developers integrate hardware awareness into their applications.',
    does: 'Scan silicon, adapt execution, and run inference that knows the machine it lands on.',
  },
  {
    id: 'device',
    view: 'device',
    num: '02',
    title: 'TouchAI Device',
    audience: 'Consumer & prosumer',
    tagline: 'The Situated Agent',
    what: 'An AI agent that lives on your specific machine and develops a genuine understanding of it over time.',
    does: 'The intelligence that manages all assistants — with context no cloud model can acquire.',
    arc: 'As the situated agent learns more about the machine and the user\'s patterns, it becomes the most capable AI interface on that device — not because it\'s the smartest model, but because it has context no cloud model can acquire.',
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
    name: 'scanHardware()',
    pillar: 'situation',
    desc: 'Full hardware profile — silicon, memory, sensors, form factor, and live awareness layers.',
    code: `const hw = await scanHardware();\n// → { platform, arch, cores, gpu, npu, layers… }`,
  },
  {
    name: 'adaptExecution(model, hw)',
    pillar: 'adaptation',
    desc: 'Select quantization, backend, token budget, and latency tier for this machine.',
    code: `const plan = adaptExecution(model, hw);\n// → { backend, quant, budget, latencyTarget }`,
  },
  {
    name: 'runInference(query, ctx)',
    pillar: 'adaptation',
    desc: 'Hardware-aware generation grounded in this device’s situation.',
    code: `const { response, latency } = await runInference(\n  query, hw, model, history\n);`,
  },
  {
    name: 'attestIntegrity()',
    pillar: 'deployment',
    desc: 'Hardware-rooted attestation — prove where inference ran.',
    code: `const proof = await attestIntegrity();\n// → { deviceId, enclave, signature }`,
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
  { step: 1, view: 'vision', title: 'Vision', desc: 'Situational intelligence, not smarter models' },
  { step: 2, view: 'sdk', title: 'SDK', desc: 'Hardware awareness for developers' },
  { step: 3, view: 'device', title: 'Device', desc: 'The Situated Agent on your machine' },
  { step: 4, view: 'live', title: 'Live', desc: 'Prove it on this hardware' },
];

export const VIEW_FOCUS = {
  vision: { label: 'Vision · situational intelligence', checks: ['situation', 'deployment'] },
  sdk: { label: 'SDK · developer interface', checks: ['situation', 'adaptation', 'deployment'] },
  device: { label: 'Device · situated agent', checks: ['situation', 'adaptation'] },
  live: { label: 'Live · hardware-aware inference', checks: ['situation', 'adaptation', 'deployment'] },
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
