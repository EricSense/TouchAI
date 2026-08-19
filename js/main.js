import { createTouch, createWebAdapter, ACTIONS } from 'touchai-sdk';

const world = document.getElementById('world');
const statusEl = document.getElementById('worldStatus');
const auditLog = document.getElementById('auditLog');
const planList = document.getElementById('planList');
const catalog = document.getElementById('actionCatalog');
const qty = document.getElementById('qty');
const total = document.getElementById('total');

const DEMO_PLAN = [
  { name: 'web.read', args: { selector: '#total' }, label: 'Observe total' },
  { name: 'web.type', args: { selector: '#email', text: 'agent@touch.ai', clear: true }, label: 'Fill email' },
  { name: 'web.type', args: { selector: '#qty', text: '2', clear: true }, label: 'Set quantity' },
  { name: 'web.click', args: { selector: '#pay' }, label: 'Click Pay now' },
];

function flash(selector) {
  const el = world.querySelector(selector);
  if (!el) return;
  el.classList.remove('touched');
  void el.offsetWidth;
  el.classList.add('touched');
  setTimeout(() => el.classList.remove('touched'), 700);
}

qty?.addEventListener('input', () => {
  const n = Math.max(1, Number(qty.value) || 1);
  total.textContent = `$${n * 48}`;
});

document.getElementById('pay')?.addEventListener('click', () => {
  statusEl.textContent = `Paid ${total.textContent} · order simulated`;
  statusEl.classList.add('ok');
});

document.getElementById('save')?.addEventListener('click', () => {
  statusEl.textContent = 'Cart saved';
  statusEl.classList.add('ok');
});

world?.addEventListener('touchai:navigate', (e) => {
  statusEl.textContent = `Navigated → ${e.detail.url}`;
});

const touch = createTouch({
  allow: ['web.click', 'web.type', 'web.read', 'web.navigate', 'web.submit', 'http.request', 'device.command'],
  requireConfirm: [],
  adapters: {
    web: createWebAdapter(world),
  },
  onAudit: renderAudit,
});

function renderCatalog() {
  if (!catalog) return;
  catalog.innerHTML = Object.entries(ACTIONS).map(([name, meta]) => `
    <div class="action-chip">
      <code>${name}</code>
      <p>${meta.description}</p>
    </div>
  `).join('');
}

function renderPlan(states = {}) {
  planList.innerHTML = DEMO_PLAN.map((step, i) => `
    <div class="plan-step ${states[i] ?? ''}" data-step="${i}">
      <span class="n">${i + 1}</span>
      <div>
        <div>${step.label}</div>
        <code>${step.name}(${JSON.stringify(step.args)})</code>
      </div>
    </div>
  `).join('');
}

function renderAudit() {
  const entries = touch.history();
  auditLog.innerHTML = entries.length
    ? entries.map((e) => `
        <li class="${e.status}">
          ${e.status.toUpperCase()} · ${e.name}
          ${e.error ? ` · ${e.error}` : ''}
          ${e.result ? ` · ${escapeJson(e.result)}` : ''}
        </li>
      `).join('')
    : '<li>No actions yet</li>';
}

function escapeJson(v) {
  try {
    return JSON.stringify(v).slice(0, 80);
  } catch {
    return '';
  }
}

async function runDemo() {
  const btn = document.getElementById('runDemo');
  btn.disabled = true;
  statusEl.textContent = 'Agent plan running via TouchAI…';
  statusEl.classList.remove('ok');
  touch.clearHistory();
  renderAudit();

  const states = {};
  for (let i = 0; i < DEMO_PLAN.length; i++) {
    states[i] = 'running';
    renderPlan(states);
    const step = DEMO_PLAN[i];
    if (step.args.selector) flash(step.args.selector);
    const entry = await touch.act(step);
    states[i] = entry.status === 'ok' ? 'ok' : 'error';
    renderPlan(states);
    renderAudit();
    await wait(450);
    if (step.name === 'web.type' && step.args.selector === '#qty') {
      total.textContent = `$${(Number(qty.value) || 1) * 48}`;
    }
  }

  statusEl.textContent = 'Plan complete — every touch audited';
  statusEl.classList.add('ok');
  btn.disabled = false;
}

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

document.getElementById('runDemo')?.addEventListener('click', runDemo);
document.getElementById('clearAudit')?.addEventListener('click', () => {
  touch.clearHistory();
  renderAudit();
});

renderCatalog();
renderPlan();
renderAudit();
