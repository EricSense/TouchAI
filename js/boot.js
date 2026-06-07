import { scanHardware } from './hardware.js';

export async function runBootSequence(onComplete) {
  const logEl = document.getElementById('bootLog');
  const progressEl = document.getElementById('bootProgress');
  const bootEl = document.getElementById('boot');

  const hw = await scanHardware();
  const lines = buildBootLines(hw);
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
      }, 400);
      return;
    }

    appendLine(lines[i]);
    progressEl.style.width = `${((i + 1) / lines.length) * 100}%`;
    i++;
    setTimeout(tick, 50 + Math.random() * 70);
  }

  tick();
}

function buildBootLines(hw) {
  const pad = (n, w = 3) => String(n).padStart(w, '0');
  const a = hw.awareness;
  let t = 0;
  const line = (msg, cls = '') => {
    const entry = { text: `[${pad(t, 4)}.${String(Math.floor(Math.random() * 999)).padStart(3, '0')}] ${msg}`, cls };
    t += 1;
    return entry;
  };

  return [
    line('TouchAI v3.0 — hardware-aware AI runtime kernel', 'info'),
    line('The layer between every AI model and every machine on earth.', 'info'),
    line('Mounting 8-layer awareness stack…', ''),
    line(`  [1/8] Silicon    → ${a.silicon.platform} ${a.silicon.arch} · ${a.silicon.cores}`, 'ok'),
    line(`  [2/8] Thermal    → ${a.thermal.state} · ${a.thermal.headroom}`, 'ok'),
    line(`  [3/8] Power      → ${a.power.level} · ${a.power.budget}`, 'ok'),
    line(`  [4/8] Memory     → ${a.memory.ram}`, 'ok'),
    line(`  [5/8] Sensors    → ${a.sensors.active}`, 'ok'),
    line(`  [6/8] Peripherals→ ${a.peripherals.connected}`, 'ok'),
    line(`  [7/8] History    → ${a.history.scans} scans · ${a.history.avgLatency}`, 'ok'),
    line(`  [8/8] User       → ${a.user.rhythm}`, 'ok'),
    line(`  gpu        → ${hw.gpu}`, 'ok'),
    line(`  npu        → ${hw.npu}`, hw.npu.includes('WASM') ? 'warn' : 'ok'),
    line(`  form factor→ ${hw.formFactor}${hw.touch ? ' · touch' : ''}`, 'ok'),
    line('TouchAI Adaptive Runtime online — all layers active', 'ok'),
    line('Touch input · voice · memory · stats: online', 'ok'),
    line(`Hardware profile locked — ${hw.layersActive}/${hw.layersTotal} layers`, 'info'),
    line('TouchAI ready. AI that knows your hardware.', 'info'),
  ];
}
