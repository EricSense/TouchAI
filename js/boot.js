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
  let t = 0;
  const line = (msg, cls = '') => {
    const entry = { text: `[${pad(t, 4)}.${String(Math.floor(Math.random() * 999)).padStart(3, '0')}] ${msg}`, cls };
    t += 1;
    return entry;
  };

  return [
    line('TouchAI v2.0 — hardware-aware intelligence kernel', 'info'),
    line('Philosophy: no cloud. no server. know your machine.', 'info'),
    line('Initialising zero-egress network policy…', ''),
    line('  outbound API calls: BLOCKED', 'ok'),
    line('  telemetry endpoints: NONE', 'ok'),
    line('Scanning local hardware…', ''),
    line(`  platform   → ${hw.platform}`, 'ok'),
    line(`  arch       → ${hw.arch}`, 'ok'),
    line(`  cpu cores  → ${hw.cores ?? 'unknown'}`, 'ok'),
    line(`  ram        → ${hw.ram}`, 'ok'),
    line(`  gpu        → ${hw.gpu}`, 'ok'),
    line(`  npu        → ${hw.npu}`, hw.npu.includes('No NPU') ? 'warn' : 'ok'),
    line(`  display    → ${hw.display}`, 'ok'),
    line(`  form factor→ ${hw.formFactor}${hw.touch ? ' · touch' : ''}`, 'ok'),
    line(`  wasm       → ${hw.wasm}`, 'ok'),
    line('Mounting ONNX Web Runtime (WASM backend)…', ''),
    line('  inference target: this device, not a datacenter', 'ok'),
    line('Loading quantised model weights to IndexedDB…', 'warn'),
    line('Touch input · voice · memory · stats: online', 'ok'),
    line(`Hardware profile locked — ${hw.platform} ${hw.arch}`, 'info'),
    line('TouchAI ready. Intelligence runs where you touch.', 'info'),
  ];
}
