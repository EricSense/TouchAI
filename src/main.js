import {
  createTouchAI,
  scanHardware,
  adaptExecution,
  recommendAssistant,
  HARDWARE_LAYERS,
} from 'touchai-sdk';

const heroHost = document.getElementById('heroHost');
const situationEl = document.getElementById('situation');
const adaptEl = document.getElementById('adapt');
const routeEl = document.getElementById('route');
const logEl = document.getElementById('log');
const askForm = document.getElementById('askForm');
const askInput = document.getElementById('askInput');
const chips = document.getElementById('chips');
const rescanBtn = document.getElementById('rescan');

let touch = null;

const PROMPTS = [
  'What does TouchAI do?',
  'How does TouchAI work?',
  'What is my hardware situation?',
  'Which assistant should handle a heavy job?',
  'Can we run locally?',
];

function esc(s) {
  const n = document.createElement('span');
  n.textContent = s ?? '';
  return n.innerHTML;
}

function renderSituation(hw) {
  situationEl.innerHTML = `
    <div class="sit-top">
      <strong>${esc(hw.platform)}</strong>
      <span>${esc(hw.arch)} · ${esc(String(hw.cores))} cores · ${esc(hw.ram)}</span>
    </div>
    <div class="layers">
      ${hw.layers.map((l) => `
        <div class="layer">
          <span>${esc(l.name)}</span>
          <span>${esc(l.summary)}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function renderAdapt(plan) {
  adaptEl.innerHTML = `
    <div class="kv"><span>Device</span><strong>${esc(plan.device)}</strong></div>
    <div class="kv"><span>Dtype</span><strong>${esc(plan.dtype)}</strong></div>
    <div class="kv"><span>Tokens</span><strong>${esc(String(plan.maxTokens))}</strong></div>
    <div class="kv"><span>Defer</span><strong>${plan.shouldDefer ? 'yes' : 'no'}</strong></div>
    <p class="reasons">${(plan.reasons ?? []).map(esc).join(' · ')}</p>
  `;
}

function renderRoute(route) {
  routeEl.innerHTML = `
    <div class="route-main">
      <strong>${esc(route.name)}</strong>
      <span>${Math.round(route.confidence * 100)}%</span>
    </div>
    <p class="reasons">${route.reasons.map(esc).join(' · ')}</p>
  `;
}

function addMsg(role, text, meta = '') {
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  div.innerHTML = `<pre>${esc(text)}</pre>${meta ? `<span class="meta">${esc(meta)}</span>` : ''}`;
  logEl.appendChild(div);
  logEl.scrollTop = logEl.scrollHeight;
}

async function refresh(force = false) {
  rescanBtn.disabled = true;
  rescanBtn.textContent = 'Scanning…';
  try {
    touch = await createTouchAI({ forceScan: force });
    const { hardware: hw, plan, route } = touch;
    heroHost.textContent = `This host · ${hw.platform} · ${plan.device}/${plan.dtype} · ${route.name}`;
    renderSituation(hw);
    renderAdapt(plan);
    renderRoute(route);
  } finally {
    rescanBtn.disabled = false;
    rescanBtn.textContent = 'Rescan';
  }
}

async function ask(q) {
  const query = (q || '').trim();
  if (!query || !touch) return;
  addMsg('user', query);
  askInput.value = '';
  const { response, plan, route, latency, engine } = await touch.runInference(query);
  renderAdapt(plan);
  renderRoute(route);
  addMsg('assistant', response, `${Math.round(latency)}ms · ${plan.device}/${plan.dtype} · ${engine}`);
}

chips.innerHTML = PROMPTS.map((p) => `<button type="button" data-q="${esc(p)}">${esc(p)}</button>`).join('');
chips.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => ask(b.dataset.q)));

askForm.addEventListener('submit', (e) => {
  e.preventDefault();
  ask(askInput.value);
});

rescanBtn.addEventListener('click', () => refresh(true));

addMsg('assistant', 'TouchAI makes AI hardware-aware.\nAsk what it does, how it works, or about this host.');
refresh(false);

// Keep layers constant available for debugging
void HARDWARE_LAYERS;
void scanHardware;
void adaptExecution;
void recommendAssistant;
