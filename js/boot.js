import { scanHardware } from './hardware.js';
import { detectCapabilities, adaptExecution } from 'touchai-sdk';

export async function runBootSequence(onComplete) {
  const logEl = document.getElementById('bootLog');
  const progressEl = document.getElementById('bootProgress');
  const bootEl = document.getElementById('boot');

  const hw = await scanHardware();
  const caps = await detectCapabilities();
  const plan = await adaptExecution(hw.recommendedModel, hw, caps);
  const lines = buildBootLines(hw, caps, plan);
  let i = 0;

  function appendLine({ text, cls = '' }) {
    const span = document.createElement('span');
    span.className = `line ${cls}`;
    span.textContent = text;
    logEl.appendChild(span);
    logEl.scrollTop = logEl.scrollHeight;
  }

  function tick() {
    if (i >= lines.length) {
      progressEl.style.width = '100%';
      setTimeout(() => {
        bootEl.classList.add('fade-out');
        bootEl.setAttribute('aria-hidden', 'true');
        document.getElementById('app').classList.remove('hidden');
        onComplete?.(hw);
      }, 350);
      return;
    }

    appendLine(lines[i]);
    progressEl.style.width = `${((i + 1) / lines.length) * 100}%`;
    i++;
    setTimeout(tick, 40 + Math.random() * 50);
  }

  tick();
}

function buildBootLines(hw, caps, plan) {
  const pad = (n, w = 3) => String(n).padStart(w, '0');
  const a = hw.awareness;
  let t = 0;
  const line = (msg, cls = '') => {
    const entry = {
      text: `[${pad(t, 4)}.${String(Math.floor(Math.random() * 999)).padStart(3, '0')}] ${msg}`,
      cls,
    };
    t += 1;
    return entry;
  };

  return [
    line('TouchAI — Hardware-Aware AI', 'info'),
    line('Probing this machine’s situation…', ''),
    line(`  Silicon  → ${a.silicon.platform} ${a.silicon.arch} · ${a.silicon.cores}`, 'ok'),
    line(`  Thermal  → ${a.thermal.state} · ${a.thermal.headroom}`, 'ok'),
    line(`  Power    → ${a.power.level} · ${a.power.budget}`, 'ok'),
    line(`  Memory   → ${a.memory.ram}`, 'ok'),
    line(`  Sensors  → ${a.sensors.active}`, 'ok'),
    line(`  WebGPU   → ${caps.webgpu ? 'available' : 'not available'}`, caps.webgpu ? 'ok' : 'warn'),
    line(`  WASM     → ${caps.wasm ? 'available' : 'missing'}`, caps.wasm ? 'ok' : 'warn'),
    line(`  Adapt    → ${plan.device} · ${plan.dtype} · ${plan.maxTokens} tok`, 'ok'),
    line(`  Why      → ${(plan.reasons ?? []).slice(0, 2).join(' · ')}`, 'info'),
    line('Hardware-Aware AI ready on this machine.', 'info'),
  ];
}
