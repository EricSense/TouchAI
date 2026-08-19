import { hardwareSummary } from './hardware.js';
import { MODELS, MODEL_ORDER, getModel } from './models.js';
import { PRODUCTS } from './focus.js';
import { renderAdaptPanel } from './focus-ui.js';
import {
  MemoryStore,
  recordDeviceVisit,
  situatedSummary,
  adaptExecution,
  getEngineStatus,
} from 'touchai-sdk';
import { SessionStats } from './stats.js';
import { generate, preloadModel } from './inference.js';
import { initVoice, isVoiceSupported } from './voice.js';

let hardware = null;
let activeModel = 'pulse';
let isGenerating = false;

const memory = new MemoryStore({ persist: true });
const stats = new SessionStats();

let chatMessages, chatInput, sendBtn, voiceBtn, voiceStatus;
let memoryList, memoryEmpty, modelList;

/** Situated Agent — manages assistants using hardware situation */
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
    when: 'Route here when user rhythm is active coding + enough RAM',
  },
];

const STARTER_PROMPTS = [
  'Which assistant should handle a heavy job right now?',
  'Can we run locally on this machine?',
  'What is my hardware situation?',
  'Route the next task for me',
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
          <div class="nav-label">Machine situation</div>
          <div class="hw-scan-badge live" id="hwScanBadge">8/8 layers</div>
          <div class="hw-grid" id="hwAwarenessGrid"></div>
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
          <div class="input-label">${product.tagline} — manages assistants with hardware context</div>
          <div class="input-wrap">
            <textarea id="chatInput" class="chat-input" placeholder="Ask the Situated Agent to route, situate, or decide…" rows="1"></textarea>
            <button id="voiceBtn" class="icon-btn voice-btn interactive" aria-label="Voice">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            </button>
            <button id="sendBtn" class="send-btn interactive" aria-label="Run">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
              </svg>
            </button>
          </div>
          <div id="voiceStatus" class="voice-status hidden">Listening on-device…</div>
          <div class="prompt-chips" id="promptChips"></div>
        </div>
      </section>

      <aside class="memory-panel">
        <div class="panel-header">
          <span class="panel-title">Agent memory</span>
          <button id="clearMemory" class="text-btn interactive">Clear</button>
        </div>
        <ul id="memoryList" class="memory-list"></ul>
        <div id="memoryEmpty" class="memory-empty">Learns this machine over time.<br/>Context no cloud model can acquire.</div>
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
    renderHardware(hardware);
    renderAssistants();
    renderModels();
    renderAdaptPanel(root.querySelector('#adaptPanel'), hardware, activeModel);
    showWelcome(hardware);
    renderPromptChips();
    renderAgentContext();
    memory.render(memoryList, memoryEmpty);
    stats.renderMini(root.querySelector('#statsMini'));
    const badge = document.getElementById('modelBadge');
    if (badge) badge.textContent = getModel(activeModel).name;
    updateDemoHeader();
  }

  wireDemoEvents(root);
  setupVoice();
}

function updateDemoHeader() {
  const title = document.getElementById('demoTitle');
  if (title) title.textContent = `Situated Agent · ${hardware?.platform ?? 'Device'}`;
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

async function renderAssistants() {
  const el = document.getElementById('assistantList');
  if (!el || !hardware) return;
  const plan = await adaptExecution(activeModel, hardware);
  const pick = plan.shouldDefer || plan.device === 'cpu' ? 'cloud' : 'local';

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
    <div class="nav-label">Long arc</div>
    <p class="ctx-hint">${situated.line}</p>
    <p class="ctx-hint">Not the smartest model — the one with context no cloud model can acquire.</p>
  `;
}

function renderPromptChips() {
  const el = document.getElementById('promptChips');
  if (!el) return;
  el.innerHTML = `
    <div class="prompt-chips-label">Situated Agent</div>
    <div class="prompt-chips-row">
      ${STARTER_PROMPTS.map((p) => `<button type="button" class="prompt-chip interactive">${esc(p)}</button>`).join('')}
    </div>
  `;
  el.querySelectorAll('.prompt-chip').forEach((chip) => {
    chip.addEventListener('click', () => sendQuery(chip.textContent));
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
    li.addEventListener('click', () => {
      activeModel = id;
      renderModels();
      renderAdaptPanel(document.getElementById('adaptPanel'), hardware, id);
      renderAssistants();
      const badge = document.getElementById('modelBadge');
      if (badge) badge.textContent = getModel(id).name;
    });
    modelList.appendChild(li);
  }
}

async function showWelcome(hw) {
  if (!chatMessages) return;
  const plan = await adaptExecution(hw.recommendedModel, hw);
  const product = PRODUCTS.find((p) => p.id === 'try');
  chatMessages.innerHTML = `
    <div class="chat-welcome">
      <p class="mvp-pill compact">MVP prototype</p>
      <h2>Situated Agent</h2>
      <p class="welcome-thesis">${product.what}</p>
      <p class="welcome-thesis">${product.does}</p>
      <p class="welcome-thesis">Live on <strong>${hw.platform}</strong> · path <strong>${plan.device}/${plan.dtype}</strong> · ${hw.layersActive} layers.</p>
      <div class="welcome-hw">
        <div class="welcome-hw-item"><span>Route</span><span>${plan.shouldDefer ? 'prefer cloud' : 'local ok'}</span></div>
        <div class="welcome-hw-item"><span>Device</span><span>${esc(plan.device)}</span></div>
        <div class="welcome-hw-item"><span>Power</span><span>${esc(hw.awareness.power.level)}</span></div>
      </div>
    </div>
  `;
}

function esc(t) {
  const s = document.createElement('span');
  s.textContent = t ?? '';
  return s.innerHTML;
}

function appendMessage(role, content, meta) {
  chatMessages.querySelector('.chat-welcome')?.remove();
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  div.innerHTML = `<div class="msg-bubble">${esc(content)}</div>${meta ? `<div class="msg-meta">${meta}</div>` : ''}`;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendQuery(text) {
  const query = text.trim();
  if (!query || isGenerating || !hardware) return;

  isGenerating = true;
  sendBtn.disabled = true;
  chatInput.value = '';

  memory.addQuery(query);
  memory.addTurn('user', query);
  memory.render(memoryList, memoryEmpty);
  appendMessage('user', query);

  const thinking = document.createElement('div');
  thinking.className = 'msg assistant thinking';
  thinking.innerHTML = '<div class="msg-bubble">Reading machine situation…</div>';
  chatMessages.appendChild(thinking);

  const { response, latency, tokens, plan, engine } = await generate(
    query, hardware, activeModel, memory.getConversationHistory(), { role: 'situated-agent' },
  );

  thinking.remove();
  memory.addTurn('assistant', response);
  appendMessage('assistant', response, `${Math.round(latency)}ms · ${plan.device}/${plan.dtype} · ${engine}`);

  const runtimeBadge = document.getElementById('runtimeBadge');
  if (runtimeBadge) runtimeBadge.textContent = `${plan.device} · ${plan.dtype}`;
  const deviceBadge = document.getElementById('deviceBadge');
  if (deviceBadge) deviceBadge.textContent = plan.device;
  await renderAssistants();
  await renderAdaptPanel(document.getElementById('adaptPanel'), hardware, activeModel);

  stats.record(latency, tokens);
  isGenerating = false;
  sendBtn.disabled = false;
}

function wireDemoEvents(root) {
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendQuery(chatInput.value);
    }
  });
  sendBtn.addEventListener('click', () => sendQuery(chatInput.value));
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
  return preloadModel(activeModel, onProgress);
}

export function getDemoStatus(hw) {
  return `${hardwareSummary(hw)} · MVP · Situated Agent`;
}
