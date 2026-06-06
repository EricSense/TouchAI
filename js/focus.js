/**
 * TouchAI product focus — single source of truth for thesis and pillars.
 * Every view must trace back to these three ideas.
 */

export const THESIS = {
  problem:
    'Every AI product today assumes cloud-first: type a prompt, wait for a server, hope your data stays private.',
  insight: 'Nobody is building AI that knows the hardware it runs on.',
  promise: 'TouchAI is the runtime layer between AI applications and silicon — zero egress, hardware-adaptive.',
};

export const PILLARS = [
  {
    id: 'hardware',
    label: 'Knows your hardware',
    desc: 'Scans CPU, GPU, RAM, NPU, and form factor at runtime. Every inference adapts to the machine it sits on.',
  },
  {
    id: 'egress',
    label: 'Zero egress',
    desc: 'No API calls. No datacenter hop. Prompts and answers stay on-device — 0 bytes sent, always.',
  },
  {
    id: 'runtime',
    label: 'One runtime, every vertical',
    desc: 'Foundation models, search, coding, robotics, healthcare, creative — one hardware-aware layer for all 34 companies.',
  },
];

export const FLOW = ['Touch or speak', 'Hardware scan', 'Model route', 'Local inference', 'Answer on-device'];

export function focusLine(hw) {
  const machine = hw ? `${hw.platform} · ${hw.cores ?? '?'} cores` : 'your device';
  return `Intelligence on ${machine} — 0 bytes egress`;
}

/** Guided path — Platform → Solutions → Demo */
export const JOURNEY = [
  { step: 1, view: 'platform', title: 'Thesis', desc: 'Understand why cloud-first AI breaks on-device' },
  { step: 2, view: 'solutions', title: 'Verticals', desc: 'See TouchAI fit across 7 verticals and 34 companies' },
  { step: 3, view: 'demo', title: 'Prove it', desc: 'Run hardware-aware inference on this machine' },
];

/** Runtime SDK surface — maps to pillars */
export const RUNTIME_API = [
  {
    name: 'scanHardware()',
    pillar: 'hardware',
    desc: 'Detect platform, CPU, GPU, RAM, NPU, form factor at runtime.',
    code: `const hw = await scanHardware();\n// → { platform, arch, cores, gpu, npu, ... }`,
  },
  {
    name: 'runInference(query, ctx)',
    pillar: 'hardware',
    desc: 'Hardware-aware generation with vertical and company context baked in.',
    code: `const { response, latency } = await runInference(\n  query, hw, model, history, { vertical, company }\n);`,
  },
  {
    name: 'getNetworkStats()',
    pillar: 'egress',
    desc: 'Always returns { bytesSent: 0, serverCalls: 0 } — zero egress by design.',
    code: `const net = getNetworkStats();\n// → { bytesSent: 0, policy: "zero-egress" }`,
  },
  {
    name: 'loadVertical(categoryId)',
    pillar: 'runtime',
    desc: 'Load vertical metadata — cloud problem, TouchAI gain, integration flow.',
    code: `const vertical = getCategory("healthcare");\n// → Tempus, PathAI, HIPAA context`,
  },
];

export const FOCUS_CHECKLIST = PILLARS.map((p) => p.label);
