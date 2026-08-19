import {
  createTouch,
  createWebAdapter,
  forModel,
  ACTIONS,
} from 'touchai-sdk';

const world = document.getElementById('world');
const statusEl = document.getElementById('worldStatus');
const auditLog = document.getElementById('auditLog');
const planList = document.getElementById('planList');
const catalog = document.getElementById('actionCatalog');
const providerCode = document.getElementById('providerCode');
const modelTrace = document.getElementById('modelTrace');
const qty = document.getElementById('qty');
const total = document.getElementById('total');

const SNIPPETS = {
  openai: `import { createTouch, forModel } from 'touchai-sdk'

const touch = createTouch({ allow: ['web.click', 'web.type', 'web.read'] })
const model = forModel(touch, 'openai')

const completion = await openai.chat.completions.create({
  model: 'gpt-4.1',
  messages: [
    { role: 'system', content: model.system },
    { role: 'user', content: 'Checkout for agent@touch.ai' },
  ],
  tools: model.tools,
  tool_choice: model.toolChoice,
})

const handled = await model.handle(completion)
// feed handled.results back as role: 'tool' messages`,

  anthropic: `import { createTouch, forModel } from 'touchai-sdk'

const touch = createTouch({ allow: ['web.click', 'web.type', 'web.read'] })
const model = forModel(touch, 'anthropic')

const msg = await anthropic.messages.create({
  model: 'claude-sonnet-4-20250514',
  system: model.system,
  tools: model.tools,
  messages: [{ role: 'user', content: 'Checkout for agent@touch.ai' }],
})

const handled = await model.handle(msg)
// append tool_result blocks for the next turn`,

  gemini: `import { createTouch, forModel } from 'touchai-sdk'

const touch = createTouch({ allow: ['web.click', 'web.type', 'web.read'] })
const model = forModel(touch, 'gemini')

const result = await genAI.models.generateContent({
  model: 'gemini-2.0-flash',
  contents: 'Checkout for agent@touch.ai',
  config: {
    systemInstruction: model.system,
    tools: [{ functionDeclarations: model.tools }],
  },
})

const handled = await model.handle(result)`,
};

const DEMO_CALLS = [
  { id: 'call_read_total', name: 'web.read', args: { selector: '#total' } },
  { id: 'call_type_email', name: 'web.type', args: { selector: '#email', text: 'agent@touch.ai', clear: true } },
  { id: 'call_type_qty', name: 'web.type', args: { selector: '#qty', text: '2', clear: true } },
  { id: 'call_pay', name: 'web.click', args: { selector: '#pay' } },
];

/** Simulated model turn in the provider's native tool-call shape */
function fakeModelResponse(provider) {
  if (provider === 'anthropic') {
    return {
      role: 'assistant',
      content: DEMO_CALLS.map((c) => ({
        type: 'tool_use',
        id: c.id,
        name: c.name,
        input: c.args,
      })),
    };
  }
  if (provider === 'gemini') {
    return {
      candidates: [{
        content: {
          parts: DEMO_CALLS.map((c) => ({
            functionCall: { name: c.name, args: c.args, id: c.id },
          })),
        },
      }],
    };
  }
  return {
    choices: [{
      message: {
        role: 'assistant',
        content: null,
        tool_calls: DEMO_CALLS.map((c) => ({
          id: c.id,
          type: 'function',
          function: { name: c.name, arguments: JSON.stringify(c.args) },
        })),
      },
    }],
  };
}

function tracePayload(provider, response) {
  if (provider === 'anthropic') return response.content;
  if (provider === 'gemini') return response.candidates[0].content.parts;
  return response.choices[0].message.tool_calls;
}

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

const touch = createTouch({
  allow: ['web.click', 'web.type', 'web.read', 'web.navigate', 'web.submit', 'http.request', 'device.command'],
  adapters: { web: createWebAdapter(world) },
  onAudit: renderAudit,
});

function renderCatalog() {
  catalog.innerHTML = Object.entries(ACTIONS).map(([name, meta]) => `
    <div class="action-chip">
      <code>${name}</code>
      <p>${meta.description}</p>
    </div>
  `).join('');
}

function renderProvider(provider) {
  document.querySelectorAll('.tab').forEach((t) => {
    t.classList.toggle('active', t.dataset.provider === provider);
  });
  providerCode.textContent = SNIPPETS[provider];
}

function renderPlan(steps = [], states = {}) {
  planList.innerHTML = steps.length
    ? steps.map((step, i) => `
        <div class="plan-step ${states[i] ?? ''}">
          <span class="n">${i + 1}</span>
          <div>
            <div>${step.name}</div>
            <code>${JSON.stringify(step.args)}</code>
          </div>
        </div>
      `).join('')
    : '<div class="plan-step"><span class="n">·</span><div>Waiting for model tool_calls…</div></div>';
}

function renderAudit() {
  const entries = touch.history();
  auditLog.innerHTML = entries.length
    ? entries.map((e) => `
        <li class="${e.status}">
          ${e.status.toUpperCase()} · ${e.name}
          ${e.error ? ` · ${e.error}` : ''}
          ${e.result ? ` · ${safe(e.result)}` : ''}
        </li>
      `).join('')
    : '<li>No model touches yet</li>';
}

function safe(v) {
  try { return JSON.stringify(v).slice(0, 80); } catch { return ''; }
}

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function runModelTurn() {
  const provider = document.getElementById('modelProvider').value;
  const btn = document.getElementById('runDemo');
  btn.disabled = true;
  statusEl.textContent = `Model (${provider}) requesting tools…`;
  statusEl.classList.remove('ok');
  touch.clearHistory();
  renderAudit();

  const response = fakeModelResponse(provider);
  modelTrace.textContent = JSON.stringify(tracePayload(provider, response), null, 2);

  const model = forModel(touch, provider);
  const calls = DEMO_CALLS.map((c) => ({ ...c }));
  const states = {};
  renderPlan(calls, states);

  for (let i = 0; i < calls.length; i++) {
    states[i] = 'running';
    renderPlan(calls, states);
    if (calls[i].args.selector) flash(calls[i].args.selector);

    let slice;
    if (provider === 'anthropic') {
      slice = { role: 'assistant', content: [response.content[i]] };
    } else if (provider === 'gemini') {
      slice = { candidates: [{ content: { parts: [response.candidates[0].content.parts[i]] } }] };
    } else {
      slice = {
        choices: [{
          message: {
            role: 'assistant',
            tool_calls: [response.choices[0].message.tool_calls[i]],
          },
        }],
      };
    }

    await model.handle(slice);
    states[i] = 'ok';
    renderPlan(calls, states);
    renderAudit();
    if (calls[i].name === 'web.type' && calls[i].args.selector === '#qty') {
      total.textContent = `$${(Number(qty.value) || 1) * 48}`;
    }
    await wait(420);
  }

  statusEl.textContent = `Model turn complete · ${calls.length} tool_calls → TouchAI`;
  statusEl.classList.add('ok');
  btn.disabled = false;
}

document.getElementById('runDemo')?.addEventListener('click', runModelTurn);
document.getElementById('clearAudit')?.addEventListener('click', () => {
  touch.clearHistory();
  renderAudit();
});

document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => renderProvider(tab.dataset.provider));
});

renderCatalog();
renderProvider('openai');
renderPlan();
renderAudit();
