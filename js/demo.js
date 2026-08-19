import { hardwareSummary } from './hardware.js';
import { MODELS, MODEL_ORDER, getModel } from './models.js';
import { PRODUCTS } from './focus.js';
import { renderAdaptPanel } from './focus-ui.js';
import {
  MemoryStore,
  recordDeviceVisit,
  situatedSummary,
  adaptExecution,
  recommendAssistant,
  scanHardware,
  getEngineStatus,
} from 'touchai-sdk';
import { SessionStats } from './stats.js';
import { generate, preloadModel } from './inference.js';
import { initVoice, isVoiceSupported } from './voice.js';

let hardware = null;
let activeModel = 'pulse';
let isGenerating = false;
let lastRoute = null;

const memory = new MemoryStore({ persist: true });
const stats = new SessionStats();

let chatMessages, chatInput, sendBtn, voiceBtn, voiceStatus;
let memoryList, memoryEmpty, modelList;

const ASSISTANTS = [
  {
    id: 'local',
    name: 'Local model',
    role: 'On-device inference',
    when: 'Prefer when WebGPU/WASM ready and power allows',
  },
  {
    id: 'cloud',
    name: 'Cloud assistant',
    role: 'Heavy / general work',
    when: 'Prefer when thermal/power constrained or depth deferred',
  },
  {
    id: 'code',
    name: 'Coding assistant',
    role: 'Dev workloads',
    when: 'Route here for coding intent when RAM allows',
  },
];

const STARTER_PROMPTS = [
  { label: 'Route a heavy job', q: 'Which assistant should handle a heavy job right now?' },
  { label: 'Run locally?', q: 'Can we run locally on this machine?' },
  { label: 'Read situation', q: 'What is my hardware situation?' },
  { label: 'Route coding', q: 'Route the next coding task for me' },
];

export function initDemo(hw) {
  hardware = hw;
  activeModel = hw.recommendedModel;
  recordDeviceVisit(hw);
}

export function mountDemoPanel(root) {
  const product = PRODUCTS.find((p) => p.id === 'try');

  root.innerHTML = `
    <div class="demo-layout">
      <aside class="demo-sidebar">
        <div class="hardware-panel">
          <div class="panel-header">
            <span class="nav-label">Machine situation</span>
            <button type="button" class="text-btn interactive" id="rescanBtn">Rescan</button>
          </div>
          <div class="hw-scan-badge live" id="hwScanBadge">—</div>
          <div class="hw-grid" id="hwAwarenessGrid"></div>
        </div>

        <div class="route-panel" id="routePanel">
          <div class="nav-label">Live route</div>
          <div class="route-card" id="routeCard">Reading host…</div>
        </div>

        <div class="model-panel">
          <div class="nav-label">Assistants managed</div>
          <ul class="assistant-list" id="assistantList"></ul>
        </div>
        <div class="adapt-panel" id="adaptPanel"></div>
        <div class="model-panel">
          <div class="nav-label">Local mode</div>
          <ul id="modelList" class="model-list"></ul>
        </div>
      </aside>

      <section class="intel-panel">
        <div id="chatMessages" class="chat-messages"></div>
        <div class="chat-input-area">
          <div class="input-label">How it works live — Scan → Adapt → Route → Run on this host</div>
          <div class="input-wrap">
            <textarea id="chatInput" class="chat-input" placeholder="Ask to route, situate, or decide…" rows="1"></textarea>
            <button id="voiceBtn" class="icon-btn voice-btn interactive" aria-label="Voice" type="button">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            </button>
            <button id="sendBtn" class="send-btn interactive" aria-label="Run" type="button">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
              </svg>
            </button>
          </div>
          <div id="voiceStatus" class="voice-status hidden">Listening on-device…</div>
          <div class="prompt-chips" id="promptChips"></div>
          <div class="engine-line" id="engineLine">Engine · probing</div>
        </div>
      </section>

      <aside class="memory-panel">
        <div class="panel-header">
          <span class="panel-title">Agent memory</span>
          <button id="clearMemory" class="text-btn interactive" type="button">Clear</button>
        </div>
        <ul id="memoryList" class="memory-list"></ul>
        <div id="memoryEmpty" class="memory-empty">Learns this machine over time.<br/>Depth compounds on this host.</div>
        <div class="demo-context" id="demoContext"></div>
        <div class="stats-mini" id="statsMini"></div>
      </aside>
    </div>
  `;

  chatMessages = root.querySelector('#chatMessages');
  chatInput = root.querySelector('#chatInput');
  sendBtn = root.querySelector('#sendBtn');
  voiceBtn = root.querySelector('#voiceBtn');
  voiceStatus = root.querySelector('#voiceStatus');
  memoryList = root.querySelector('#memoryList');
  memoryEmpty = root.querySelector('#memoryEmpty');
  modelList = root.querySelector('#modelList');

  if (hardware) {
    refreshPrototype();
    const badge = document.getElementById('modelBadge');
    if (badge) badge.textContent = getModel(activeModel).name;
    updateDemoHeader();
  }

  wireDemoEvents(root);
  setupVoice();
  updateEngineLine();
}

async function refreshPrototype(query = '') {
  if (!hardware) return;
  renderHardware(hardware);
  await renderRoute(query);
  await renderAssistants();
  renderModels();
  await renderAdaptPanel(document.getElementById('adaptPanel'), hardware, activeModel);
  showWelcome(hardware);
  renderPromptChips();
  renderAgentContext();
  memory.render(memoryList, memoryEmpty);
  stats.renderMini(document.getElementById('statsMini'));
  updateEngineLine();
}

function updateDemoHeader() {
  const title = document.getElementById('demoTitle');
  if (title) title.textContent = `Situated Agent · ${hardware?.platform ?? 'host'}`;
}

function updateEngineLine() {
  const el = document.getElementById('engineLine');
  if (!el) return;
  const st = getEngineStatus();
  el.textContent = st.loaded
    ? `Engine · local model on ${st.device}`
    : st.loading
      ? `Engine · loading on ${st.device}…`
      : 'Engine · situational rules (model optional)';
}

function renderHardware(hw) {
  const badge = document.getElementById('hwScanBadge');
  if (badge) badge.textContent = `${hw.layersActive}/${hw.layersTotal} layers`;
  const grid = document.getElementById('hwAwarenessGrid');
  if (grid && hw.layers) {
    grid.innerHTML = hw.layers.map((l) => `
      <div class="hw-item hw-layer">
        <span class="hw-key">${l.name}</span>
        <span class="hw-val hw-val-wrap">${esc(l.summary)}</span>
      </div>
    `).join('');
  }
}

async function renderRoute(query = '') {
  const card = document.getElementById('routeCard');
  if (!card || !hardware) return;
  const plan = await adaptExecution(activeModel, hardware);
  const route = recommendAssistant(hardware, plan, query);
  lastRoute = route;
  card.innerHTML = `
    <div class="route-pick">
      <strong>${esc(route.name)}</strong>
      <span>${Math.round(route.confidence * 100)}%</span>
    </div>
    <div class="route-path">${esc(route.path)} · ${route.tokens ?? '—'} tok</div>
    <ul class="route-reasons">
      ${route.reasons.map((r) => `<li>${esc(r)}</li>`).join('')}
    </ul>
  `;
}

async function renderAssistants() {
  const el = document.getElementById('assistantList');
  if (!el || !hardware) return;
  const plan = await adaptExecution(activeModel, hardware);
  const pick = lastRoute?.id ?? recommendAssistant(hardware, plan).id;

  el.innerHTML = ASSISTANTS.map((a) => `
    <li class="assistant-item${a.id === pick ? ' active' : ''}">
      <div class="model-row">
        <span class="model-name">${a.name}</span>
        <span class="model-speed">${a.id === pick ? 'recommended' : a.role}</span>
      </div>
      <p class="assistant-when">${esc(a.when)}</p>
    </li>
  `).join('');
}

function renderAgentContext() {
  const el = document.getElementById('demoContext');
  if (!el || !hardware) return;
  const situated = situatedSummary(hardware);
  el.innerHTML = `
    <div class="nav-label">Host memory</div>
    <p class="ctx-hint">${situated.line}</p>
    <p class="ctx-hint">Cloud solved scale. This prototype is building depth on ${esc(hardware.platform)}.</p>
  `;
}

function renderPromptChips() {
  const el = document.getElementById('promptChips');
  if (!el) return;
  el.innerHTML = `
    <div class="prompt-chips-label">Try these</div>
    <div class="prompt-chips-row">
      ${STARTER_PROMPTS.map((p) => `
        <button type="button" class="prompt-chip interactive" data-q="${esc(p.q)}">${esc(p.label)}</button>
      `).join('')}
    </div>
  `;
  el.querySelectorAll('.prompt-chip').forEach((chip) => {
    chip.addEventListener('click', () => sendQuery(chip.dataset.q));
  });
}

function renderModels() {
  if (!modelList) return;
  modelList.innerHTML = '';
  for (const id of MODEL_ORDER) {
    const m = MODELS[id];
    const li = document.createElement('li');
    li.className = `model-item interactive${id === activeModel ? ' active' : ''}`;
    li.innerHTML = `
      <div class="model-row"><span class="model-name">${m.name}</span><span class="model-speed">${m.badge}</span></div>
      <div class="model-bar"><div class="model-bar-fill" style="width:${m.speedWeight * 100}%"></div></div>
    `;
    li.addEventListener('click', async () => {
      activeModel = id;
      renderModels();
      await renderAdaptPanel(document.getElementById('adaptPanel'), hardware, id);
      await renderRoute();
      await renderAssistants();
      const badge = document.getElementById('modelBadge');
      if (badge) badge.textContent = getModel(id).name;
    });
    modelList.appendChild(li);
  }
}

async function showWelcome(hw) {
  if (!chatMessages) return;
  const plan = await adaptExecution(hw.recommendedModel, hw);
  const route = recommendAssistant(hw, plan);
  lastRoute = route;
  const product = PRODUCTS.find((p) => p.id === 'try');
  chatMessages.innerHTML = `
    <div class="chat-welcome">
      <p class="mvp-pill compact">MVP prototype</p>
      <h2>Situated Agent</h2>
      <p class="welcome-thesis">${product.does}</p>
      <p class="welcome-thesis">Live on <strong>${esc(hw.platform)}</strong> · path <strong>${esc(plan.device)}/${esc(plan.dtype)}</strong> · ${hw.layersActive} layers.</p>
      <div class="welcome-hw">
        <div class="welcome-hw-item"><span>Route</span><span>${esc(route.name)}</span></div>
        <div class="welcome-hw-item"><span>Path</span><span>${esc(plan.device)}</span></div>
        <div class="welcome-hw-item"><span>Power</span><span>${esc(hw.awareness.power.level)}</span></div>
      </div>
      <div class="welcome-actions">
        ${STARTER_PROMPTS.slice(0, 3).map((p) => `
          <button type="button" class="btn btn-ghost interactive welcome-act" data-q="${esc(p.q)}">${esc(p.label)}</button>
        `).join('')}
      </div>
    </div>
  `;
  chatMessages.querySelectorAll('.welcome-act').forEach((btn) => {
    btn.addEventListener('click', () => sendQuery(btn.dataset.q));
  });
}

function esc(t) {
  const s = document.createElement('span');
  s.textContent = t ?? '';
  return s.innerHTML;
}

function appendMessage(role, content, meta, extras = {}) {
  chatMessages.querySelector('.chat-welcome')?.remove();
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  const decision = extras.route
    ? `<div class="msg-decision">
         <span class="msg-decision-label">Decision</span>
         <strong>${esc(extras.route.name)}</strong>
         <span>${Math.round(extras.route.confidence * 100)}% · ${esc(extras.route.path)}</span>
       </div>`
    : '';
  div.innerHTML = `
    ${decision}
    <div class="msg-bubble">${esc(content)}</div>
    ${meta ? `<div class="msg-meta">${meta}</div>` : ''}
  `;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function setThinking(phase) {
  let el = chatMessages.querySelector('.msg.thinking');
  if (!el) {
    el = document.createElement('div');
    el.className = 'msg assistant thinking';
    chatMessages.appendChild(el);
  }
  el.innerHTML = `<div class="msg-bubble">${esc(phase)}</div>`;
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return el;
}

async function sendQuery(text) {
  const query = (text || '').trim();
  if (!query || isGenerating || !hardware) return;

  isGenerating = true;
  sendBtn.disabled = true;
  if (chatInput) chatInput.value = '';

  memory.addQuery(query);
  memory.addTurn('user', query);
  memory.render(memoryList, memoryEmpty);
  appendMessage('user', query);

  const thinking = setThinking('Reading machine situation…');
  await renderRoute(query);
  await renderAssistants();
  setThinking('Adapting execution plan…');

  try {
    const result = await generate(
      query,
      hardware,
      activeModel,
      memory.getConversationHistory(),
      {
        role: 'situated-agent',
        onProgress: (msg) => setThinking(msg),
      },
    );

    thinking.remove();
    memory.addTurn('assistant', result.response);
    appendMessage(
      'assistant',
      result.response,
      `${Math.round(result.latency)}ms · ${result.plan.device}/${result.plan.dtype} · ${result.engine}`,
      { route: result.route },
    );

    lastRoute = result.route;
    const runtimeBadge = document.getElementById('runtimeBadge');
    if (runtimeBadge) runtimeBadge.textContent = `${result.plan.device} · ${result.plan.dtype}`;
    const deviceBadge = document.getElementById('deviceBadge');
    if (deviceBadge) deviceBadge.textContent = result.plan.device;
    await renderRoute(query);
    await renderAssistants();
    await renderAdaptPanel(document.getElementById('adaptPanel'), hardware, activeModel);
    stats.record(result.latency, result.tokens);
    stats.renderMini(document.getElementById('statsMini'));
    updateEngineLine();
  } catch (err) {
    thinking.remove();
    appendMessage('assistant', `Prototype error: ${err.message || 'failed to answer'}. Rescan the host and try again.`);
  }

  isGenerating = false;
  sendBtn.disabled = false;
  chatInput?.focus();
}

async function rescanHost() {
  const btn = document.getElementById('rescanBtn');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Scanning…';
  }
  try {
    hardware = await scanHardware(true);
    recordDeviceVisit(hardware);
    activeModel = hardware.recommendedModel;
    await refreshPrototype();
    updateDemoHeader();
    const sit = document.getElementById('navSituation');
    if (sit) {
      const plan = await adaptExecution(activeModel, hardware);
      sit.textContent = `${hardware.platform} · ${plan.device}`;
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Rescan';
    }
  }
}

function wireDemoEvents(root) {
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendQuery(chatInput.value);
    }
  });
  chatInput.addEventListener('input', () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = `${Math.min(chatInput.scrollHeight, 120)}px`;
  });
  sendBtn.addEventListener('click', () => sendQuery(chatInput.value));
  root.querySelector('#rescanBtn')?.addEventListener('click', () => rescanHost());
  memory.onUpdate = () => memory.render(memoryList, memoryEmpty);
  memoryList.addEventListener('click', (e) => {
    const item = e.target.closest('.memory-item');
    if (item) {
      chatInput.value = memory.recall(item.dataset.id) ?? '';
      chatInput.focus();
    }
  });
  root.querySelector('#clearMemory')?.addEventListener('click', () => {
    memory.clear();
    if (hardware) showWelcome(hardware);
  });
}

function setupVoice() {
  if (!isVoiceSupported()) {
    voiceBtn.style.opacity = '0.3';
    voiceBtn.disabled = true;
    return;
  }
  let listening = false;
  const recognition = initVoice(
    (text) => { chatInput.value = text; },
    (final) => {
      listening = false;
      voiceBtn.classList.remove('listening');
      voiceStatus.classList.add('hidden');
      if (final) sendQuery(final);
    },
  );
  voiceBtn.addEventListener('click', () => {
    if (listening) {
      recognition.stop();
      return;
    }
    listening = true;
    voiceBtn.classList.add('listening');
    voiceStatus.classList.remove('hidden');
    recognition.start();
  });
}

export function preloadDemoModel(onProgress) {
  return preloadModel(activeModel, (msg) => {
    onProgress?.(msg);
    updateEngineLine();
  });
}

export function getDemoStatus(hw) {
  return `${hardwareSummary(hw)} · MVP · Situated Agent`;
}
