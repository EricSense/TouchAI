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
