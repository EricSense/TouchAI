import { hardwareSummary } from './hardware.js';
import { MODELS, MODEL_ORDER, getModel } from './models.js';
import { getCategory, getCompany } from './ecosystem.js';
import { THESIS } from './focus.js';
import { MemoryStore } from './memory.js';
import { SessionStats } from './stats.js';
import { generate, preloadModel } from './inference.js';
import { initVoice, isVoiceSupported } from './voice.js';

let hardware = null;
let activeModel = 'pulse';
let activeVertical = null;
let activeCompany = null;
let isGenerating = false;

const memory = new MemoryStore();
const stats = new SessionStats();

let chatMessages, chatInput, sendBtn, voiceBtn, voiceStatus;
let memoryList, memoryEmpty, modelList;

export function initDemo(hw) {
  hardware = hw;
  activeModel = hw.recommendedModel;
}

export function setDemoContext(categoryId, companyName) {
  activeVertical = categoryId ? getCategory(categoryId) : null;
  activeCompany = companyName ?? null;
  updateDemoHeader();
  renderDemoContext();
  renderPromptChips();
  if (hardware && chatMessages) showWelcome(hardware);
}

function updateDemoHeader() {
  const title = document.getElementById('demoTitle');
  const badge = document.getElementById('demoVerticalBadge');
  if (!title || !badge) return;

  if (activeCompany && activeVertical) {
    title.textContent = `${activeCompany} · on your hardware`;
    badge.textContent = activeVertical.name.split(' ')[0];
    badge.classList.remove('hidden');
  } else {
    title.textContent = `${hardware?.platform ?? 'Your'} · ${hardware?.formFactor ?? 'Device'}`;
    badge.classList.add('hidden');
  }
}

export function mountDemoPanel(root) {
  root.innerHTML = `
    <div class="demo-layout">
      <aside class="demo-sidebar">
        <div class="hardware-panel">
          <div class="nav-label">Your Hardware</div>
          <div class="hw-scan-badge live" id="hwScanBadge">Live scan</div>
          <div class="hw-grid">
            <div class="hw-item"><span class="hw-key">Platform</span><span class="hw-val" id="hwPlatform">—</span></div>
            <div class="hw-item"><span class="hw-key">Arch</span><span class="hw-val" id="hwArch">—</span></div>
            <div class="hw-item"><span class="hw-key">CPU</span><span class="hw-val" id="hwCores">—</span></div>
            <div class="hw-item"><span class="hw-key">RAM</span><span class="hw-val" id="hwRam">—</span></div>
            <div class="hw-item"><span class="hw-key">GPU</span><span class="hw-val hw-val-wrap" id="hwGpu">—</span></div>
            <div class="hw-item"><span class="hw-key">NPU</span><span class="hw-val hw-val-wrap" id="hwNpu">—</span></div>
          </div>
        </div>
        <div class="model-panel">
          <div class="nav-label">Inference Mode</div>
          <ul id="modelList" class="model-list"></ul>
        </div>
        <div class="demo-context" id="demoContext"></div>
      </aside>

      <section class="intel-panel">
        <div id="chatMessages" class="chat-messages"></div>
        <div class="chat-input-area">
          <div class="input-label" id="inputLabel">Processed on this device — not a datacenter</div>
          <div class="input-wrap">
            <textarea id="chatInput" class="chat-input" placeholder="Touch or speak — intelligence runs here…" rows="1"></textarea>
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
          <span class="panel-title">Session Memory</span>
          <button id="clearMemory" class="text-btn interactive">Clear</button>
        </div>
        <ul id="memoryList" class="memory-list"></ul>
        <div id="memoryEmpty" class="memory-empty">Local session only.<br/>Nothing leaves this device.</div>
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
    renderModels();
    showWelcome(hardware);
    renderPromptChips();
    stats.renderMini(root.querySelector('#statsMini'));
    const badge = document.getElementById('modelBadge');
    if (badge) badge.textContent = getModel(activeModel).name;
  }

  wireDemoEvents(root);
  setupVoice();
}

function renderHardware(hw) {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('hwPlatform', hw.platform);
  set('hwArch', hw.arch);
  set('hwCores', hw.cores != null ? `${hw.cores} cores` : 'Not exposed');
  set('hwRam', hw.ram);
  set('hwGpu', hw.gpu);
  set('hwNpu', hw.npu);
  updateDemoHeader();
  renderDemoContext();
}

function renderDemoContext() {
  const el = document.getElementById('demoContext');
  if (!el) return;
  if (!activeVertical) {
    el.innerHTML = `
      <div class="nav-label">Get started</div>
      <p class="ctx-hint">Pick a company in Solutions, or try a prompt below. Everything runs on your hardware — 0 bytes sent.</p>
    `;
    return;
  }

  const co = activeCompany && activeVertical
    ? getCompany(activeVertical.id, activeCompany)
    : null;

  el.innerHTML = `
    <div class="nav-label">Active vertical</div>
    <div class="ctx-vertical">${activeVertical.name}</div>
    ${activeCompany ? `<div class="ctx-company">${activeCompany}</div>` : ''}
    ${co ? `
      <div class="ctx-block ctx-problem"><span class="co-label">Cloud problem</span><p>${co.problem}</p></div>
      <div class="ctx-block ctx-solution"><span class="co-label co-label-accent">TouchAI layer</span><p>${co.touchai}</p></div>
    ` : `<p class="ctx-role">${activeVertical.touchaiRole}</p>`}
    <div class="ctx-metrics">
      ${Object.entries(activeVertical.metrics).map(([k, v]) => `<span><em>${k}</em> ${v}</span>`).join('')}
    </div>
  `;
}

const STARTER_PROMPTS = {
  default: [
    'What hardware am I running on?',
    'How is TouchAI different from cloud AI?',
    'Explain the zero egress policy',
  ],
  foundation: ['How would OpenAI deploy on my NPU?', 'Route a model to my GPU', 'Why not send prompts to a server?'],
  infrastructure: ['How does TouchAI sit in an ML pipeline?', 'Select WASM vs CoreML for this device'],
  productivity: ['Run a local RAG query without network', 'How does Harvey work on-device?'],
  coding: ['Complete code using my hardware budget', 'How does Cursor use TouchAI locally?'],
  robotics: ['What latency can this hardware achieve?', 'Run inference under 100ms'],
  healthcare: ['Keep PHI on this device', 'How is TouchAI HIPAA-aligned?'],
  creative: ['Scale video quality to my GPU', 'What can my VRAM handle?'],
};

function renderPromptChips() {
  const el = document.getElementById('promptChips');
  if (!el) return;

  const key = activeVertical?.id ?? 'default';
  let prompts = [...(STARTER_PROMPTS[key] ?? STARTER_PROMPTS.default)];
  if (activeCompany) prompts.unshift(`How does TouchAI work for ${activeCompany}?`);
  prompts = prompts.slice(0, 4);
  const label = activeCompany
    ? `Try with ${activeCompany}`
    : 'Focused prompts';

  el.innerHTML = `
    <div class="prompt-chips-label">${label}</div>
    <div class="prompt-chips-row">
      ${prompts.map((p) => `<button type="button" class="prompt-chip interactive">${esc(p)}</button>`).join('')}
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
      const badge = document.getElementById('modelBadge');
      if (badge) badge.textContent = getModel(id).name;
    });
    modelList.appendChild(li);
  }
}

function showWelcome(hw) {
  if (!chatMessages) return;
  const verticalLine = activeCompany
    ? `<p class="welcome-vertical">Demonstrating TouchAI for <strong>${activeCompany}</strong> (${activeVertical?.name}) on your ${hw.platform} hardware.</p>`
    : '';
  chatMessages.innerHTML = `
    <div class="chat-welcome">
      <h2>AI that knows your hardware</h2>
      ${verticalLine}
      <p class="welcome-thesis">${THESIS.problem.split('.')[0]}. TouchAI runs on <strong>${hw.platform}</strong> (${hw.arch}, ${hw.cores ?? '?'} cores) — 0 bytes egress.</p>
      <div class="welcome-hw">
        <div class="welcome-hw-item"><span>GPU</span><span>${esc(hw.gpu)}</span></div>
        <div class="welcome-hw-item"><span>Accelerator</span><span>${esc(hw.npu)}</span></div>
        <div class="welcome-hw-item"><span>Network</span><span>0 bytes sent</span></div>
      </div>
    </div>
  `;
}

function esc(t) { const s = document.createElement('span'); s.textContent = t; return s.innerHTML; }

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
  thinking.id = 'thinkingMsg';
  thinking.innerHTML = '<div class="msg-bubble">Running on your hardware</div>';
  chatMessages.appendChild(thinking);

  const ctx = { vertical: activeVertical, company: activeCompany };
  const { response, latency, tokens, network } = await generate(
    query, hardware, activeModel, memory.getConversationHistory(), ctx,
  );

  thinking.remove();
  memory.addTurn('assistant', response);
  appendMessage('assistant', response, `${Math.round(latency)}ms · ~${tokens} tok · ${network.bytesSent}B sent`);

  const egress = document.getElementById('egressBadge');
  if (egress) egress.textContent = `${network.bytesSent} bytes sent`;
  stats.record(latency, tokens);
  isGenerating = false;
  sendBtn.disabled = false;
}

function wireDemoEvents(root) {
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendQuery(chatInput.value); }
  });
  sendBtn.addEventListener('click', () => sendQuery(chatInput.value));
  memory.onUpdate = () => memory.render(memoryList, memoryEmpty);
  memoryList.addEventListener('click', (e) => {
    const item = e.target.closest('.memory-item');
    if (item) { chatInput.value = memory.recall(item.dataset.id) ?? ''; chatInput.focus(); }
  });
  root.querySelector('#clearMemory')?.addEventListener('click', () => {
    memory.clear();
    if (hardware) showWelcome(hardware);
  });
}

function setupVoice() {
  if (!isVoiceSupported()) { voiceBtn.style.opacity = '0.3'; return; }
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
    if (listening) { recognition.stop(); return; }
    listening = true;
    voiceBtn.classList.add('listening');
    voiceStatus.classList.remove('hidden');
    recognition.start();
  });
}

export function getDemoContext() {
  return { vertical: activeVertical, company: activeCompany };
}

export function preloadDemoModel(onProgress) {
  return preloadModel(activeModel, onProgress);
}

export function getDemoStatus(hw) {
  return `${hardwareSummary(hw)} · zero egress`;
}
