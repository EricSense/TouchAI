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
      }, 300);
      return;
    }
    appendLine(lines[i]);
    progressEl.style.width = `${((i + 1) / lines.length) * 100}%`;
    i++;
    setTimeout(tick, 35 + Math.random() * 40);
  }

  tick();
}

function buildBootLines(hw, caps, plan) {
  const a = hw.awareness;
  let t = 0;
  const line = (msg, cls = '') => {
    const entry = {
      text: `[${String(t).padStart(4, '0')}] ${msg}`,
      cls,
    };
    t += 1;
    return entry;
  };

  return [
    line('TouchAI — Hardware-aware AI', 'info'),
    line('How it works · Scan → Adapt → Route → Run', 'info'),
    line(`Scan · ${a.silicon.platform} ${a.silicon.arch} · ${a.silicon.cores}`, 'ok'),
    line(`Thermal · ${a.thermal.state} · Power · ${a.power.budget}`, 'ok'),
    line(`Adapt · ${plan.device}/${plan.dtype} · ${plan.maxTokens} tok`, 'ok'),
    line(`Probe · WebGPU ${caps.webgpu ? 'yes' : 'no'} · WASM ${caps.wasm ? 'yes' : 'no'}`, caps.webgpu ? 'ok' : 'warn'),
    line('Ready · open What & How, Try, or SDK', 'info'),
  ];
}
