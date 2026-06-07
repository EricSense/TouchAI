/**
 * TouchAI — single source of truth for vision, pillars, and product focus.
 * Every view must trace back to these ideas.
 */

export const THESIS = {
  founding:
    'Every major platform shift in computing has been won by whoever controlled the layer everything else runs on.',
  bet: 'The next layer to own is the hardware-aware AI runtime — between every AI model and every physical machine on earth.',
  insight: 'That layer doesn\'t exist yet. Not really.',
  promise:
    'TouchAI is the runtime that gives AI a live, dynamic understanding of the silicon it runs on — and adapts execution in real time.',
};

export const PLATFORM_WINS = [
  { era: 'PC', layer: 'Processor instruction set', owner: 'Intel' },
  { era: 'Software', layer: 'Operating system', owner: 'Microsoft' },
  { era: 'Internet', layer: 'Cloud infrastructure', owner: 'AWS' },
  { era: 'AI Training', layer: 'GPU compute runtime', owner: 'NVIDIA / CUDA' },
  { era: 'AI Inference', layer: 'Hardware-aware runtime', owner: 'TouchAI' },
];

export const HARDWARE_LAYERS = [
  { layer: 'Silicon', knows: 'Chip architecture, core count, instruction sets, GPU/NPU availability' },
  { layer: 'Thermal', knows: 'Temperature state, throttling thresholds, cooling capacity' },
  { layer: 'Power', knows: 'Battery level, charge state, power draw budget' },
  { layer: 'Memory', knows: 'RAM available, memory bandwidth, cache topology' },
  { layer: 'Sensors', knows: 'Camera, mic, GPS, accelerometer, biometrics — present and active' },
  { layer: 'Peripherals', knows: 'What\'s connected, what can extend capability' },
  { layer: 'History', knows: 'Performance fingerprint of this specific machine over time' },
  { layer: 'User', knows: 'Workload rhythms, usage patterns, behavioral signatures' },
];

export const PRODUCT_SURFACES = [
  {
    id: 'sdk',
    num: '01',
    title: 'Runtime SDK',
    tagline: 'The CUDA play',
    desc: 'Plug TouchAI into any model or app — instantly know how to run optimally on whatever machine it lands on. Dynamic inference, memory, and compute allocation in real time.',
    buyers: 'AI companies, enterprise software, AI-native app developers',
  },
  {
    id: 'oem',
    num: '02',
    title: 'OEM Partnership Layer',
    tagline: 'The Dolby play',
    desc: 'Ship inside laptops, phones, medical devices, and vehicles before the user turns them on. TouchAI becomes the AI soul of the device.',
    buyers: 'Device OEMs — licensing or rev-share on performance gains',
  },
  {
    id: 'agent',
    num: '03',
    title: 'Situated AI Agent',
    tagline: 'Intelligence that lives in your machine',
    desc: 'Not a cloud assistant — an agent that gets smarter about your specific hardware over time. Preempt workloads, manage resources, optimize compute in real time.',
    buyers: 'Prosumers, developers, power users — subscription',
  },
  {
    id: 'industrial',
    num: '04',
    title: 'Industrial & Edge OS',
    tagline: 'The operating layer',
    desc: 'Factories, hospitals, satellites, defense, autonomous vehicles. AI calibrated to exact sensor suites, thermal envelopes, and power budgets — not watered-down cloud models.',
    buyers: 'Industrial, defense, medical device, automotive OEMs — enterprise contracts',
  },
  {
    id: 'trust',
    num: '05',
    title: 'Trust & Identity Layer',
    tagline: 'Physical root of trust',
    desc: 'Hardware-grounded attestation, secure enclaves, verifiable integrity. AI that can prove where it ran and what it touched — for regulated and air-gapped environments.',
    buyers: 'Healthcare, finance, legal, government, defense — highest compliance budgets',
  },
];

/** Three pillars — everything we build serves these */
export const PILLARS = [
  {
    id: 'awareness',
    label: 'Full hardware awareness',
    desc: 'Live understanding of silicon, thermal, power, memory, sensors, peripherals, history, and user context — not just "runs on device."',
  },
  {
    id: 'adaptation',
    label: 'Adaptive execution',
    desc: 'Model size, backend, memory budget, and latency targets adjust in real time to the machine — cloud models become situated intelligence.',
  },
  {
    id: 'runtime',
    label: 'The inference layer',
    desc: 'One runtime between every AI model and every chip. Models come and go — the layer that runs them on real hardware is durable infrastructure.',
  },
];

export const MOAT = [
  {
    title: 'OEM relationships compound',
    desc: 'Once baked into firmware at the OEM level, runtime layers have upgrade cycles measured in years — extraordinarily difficult to displace.',
  },
  {
    title: 'Hardware fingerprint flywheel',
    desc: 'Performance data across millions of devices makes the runtime better. Better runtime attracts OEM partners. More partners means more data.',
  },
  {
    title: 'Models are ephemeral. Runtimes endure.',
    desc: 'GPT-4 is already old. Claude will be superseded. The layer that runs all of them on real silicon has longer cycles and stronger lock-in.',
  },
];

export const FLOW = ['Model arrives', 'Hardware scan', 'Runtime adapts', 'Situated inference', 'Machine-specific output'];

export function focusLine(hw) {
  const machine = hw ? `${hw.platform} · ${hw.cores ?? '?'} cores` : 'your device';
  const layers = hw?.layersActive ? `${hw.layersActive}/${hw.layersTotal} layers · ` : '';
  return `${layers}situated intelligence on ${machine}`;
}

export const JOURNEY = [
  { step: 1, view: 'platform', title: 'Vision', desc: 'The layer between AI models and silicon' },
  { step: 2, view: 'solutions', title: 'Verticals', desc: 'Hardware-aware runtime across 7 verticals' },
  { step: 3, view: 'demo', title: 'Prove it', desc: 'Run situated inference on this machine' },
];

export const RUNTIME_API = [
  {
    name: 'scanHardware()',
    pillar: 'awareness',
    desc: 'Full hardware profile — silicon, memory, sensors, form factor, and runtime backends.',
    code: `const hw = await scanHardware();\n// → { platform, arch, cores, gpu, npu, ram, ... }`,
  },
  {
    name: 'adaptExecution(model, hw)',
    pillar: 'adaptation',
    desc: 'Select quantisation, backend, token budget, and latency tier for this machine.',
    code: `const plan = adaptExecution(model, hw);\n// → { backend: "CoreML", quant: "q8", budget: "pulse" }`,
  },
  {
    name: 'runInference(query, ctx)',
    pillar: 'adaptation',
    desc: 'Hardware-aware generation with vertical and company context baked in.',
    code: `const { response, latency } = await runInference(\n  query, hw, model, history, { vertical, company }\n);`,
  },
  {
    name: 'attestIntegrity()',
    pillar: 'runtime',
    desc: 'Hardware-rooted trust for regulated deployments — prove where inference ran.',
    code: `const proof = await attestIntegrity();\n// → { deviceId, enclave, signature }`,
  },
  {
    name: 'loadVertical(categoryId)',
    pillar: 'runtime',
    desc: 'Load vertical metadata — hardware gap, TouchAI capability, integration flow.',
    code: `const vertical = getCategory("healthcare");\n// → Tempus, PathAI, clinical context`,
  },
];

export const FOCUS_CHECKLIST = PILLARS.map((p) => p.label);
