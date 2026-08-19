import { PRODUCTS, SDK_API, HARDWARE_LAYERS } from './focus.js';
import {
  adaptExecution,
  formatAdaptPlan,
  detectCapabilities,
  attestIntegrity,
  SDK_VERSION,
  MODELS,
  MODEL_ORDER,
} from 'touchai-sdk';

const product = () => PRODUCTS.find((p) => p.id === 'sdk');

/**
 * TouchAI SDK — developer product.
 * Playground: scan → adapt → see what changes for a model.
 * Not a chatbot.
 */
export async function renderSdkView(container, hw) {
  const p = product();
  const caps = await detectCapabilities();
  let modelId = hw?.recommendedModel ?? 'pulse';
  let plan = hw ? await adaptExecution(modelId, hw, caps) : null;

  container.innerHTML = `
    <div class="product-view sdk-view">
      <section class="product-hero">
        <p class="brand-mark compact">TouchAI</p>
        <p class="section-kicker">02 · Developer product · v${SDK_VERSION}</p>
        <h1 class="product-hero-title">TouchAI SDK</h1>
        <p class="product-hero-tag">${p.tagline}</p>
        <p class="product-hero-lead">${p.what}</p>
        <p class="mvp-pill compact">MVP · install from this repo</p>
      </section>

      <section class="section" id="sdkInstall">
        <p class="section-kicker">Install</p>
        <h2 class="section-title">Integrate hardware awareness.</h2>
        <p class="section-lead">Give any model a relationship with its physical host — deep knowledge of the hardware it runs on.</p>
        <div class="install-block">
          <pre class="api-code"><code>npm install ./sdk
# from a clone of github.com/EricSense/TouchAI</code></pre>
          <pre class="api-code"><code>import { createTouchAI } from 'touchai-sdk'

const touch = await createTouchAI()
// touch.hardware — 8-layer situation
// touch.plan     — device / dtype adapted to this machine
await touch.runInference(prompt)</code></pre>
        </div>
      </section>

      <section class="section">
        <p class="section-kicker">API</p>
        <h2 class="section-title">Four calls. Full situation.</h2>
        <div class="api-grid">
          ${SDK_API.map((api) => `
            <article class="api-card">
              <div class="api-head"><code class="api-name">${api.name}</code></div>
              <p>${api.desc}</p>
              <pre class="api-code"><code>${api.code}</code></pre>
            </article>
          `).join('')}
        </div>
      </section>

      <section class="section" id="sdkPlayground">
        <p class="section-kicker">Playground · this machine</p>
        <h2 class="section-title">See hardware-aware adaptation.</h2>
        <p class="section-lead">Without TouchAI, a model is homeless on the machine. With TouchAI, execution follows a probed plan for this host.</p>

        <div class="playground">
          <div class="playground-col">
            <div class="nav-label">1 · Situation</div>
            <div class="live-plan">
              ${hw ? hw.layers.map((l) => `
                <div class="adapt-row"><span>${l.name}</span><span>${esc(l.summary)}</span></div>
              `).join('') : '<p class="ctx-hint">Scan pending…</p>'}
            </div>
          </div>

          <div class="playground-col">
            <div class="nav-label">2 · Capabilities (probed)</div>
            <div class="live-plan">
              <div class="adapt-row"><span>WebGPU</span><span>${caps.webgpu ? 'available' : 'no'}</span></div>
              <div class="adapt-row"><span>WASM</span><span>${caps.wasm ? 'available' : 'no'}</span></div>
              <div class="adapt-row"><span>WebNN</span><span>${caps.webnn ? 'available' : 'no'}</span></div>
            </div>
            <div class="nav-label" style="margin-top:16px">3 · Model to situate</div>
            <div class="playground-models" id="sdkModelPick">
              ${MODEL_ORDER.map((id) => `
                <button type="button" class="prompt-chip interactive${id === modelId ? ' active-chip' : ''}" data-model="${id}">${MODELS[id].name}</button>
              `).join('')}
            </div>
          </div>

          <div class="playground-col">
            <div class="nav-label">4 · Adapt plan (honored by runtime)</div>
            <div class="live-plan" id="sdkPlanPanel">
              ${plan ? renderPlan(plan) : ''}
            </div>
            <div id="sdkAttest" class="attest-panel" style="margin-top:12px"></div>
          </div>
        </div>

        <div class="compare-row">
          <article class="compare-card">
            <h3>Homeless model</h3>
            <p>Same model everywhere. No relationship with cores, thermal, power, or accelerator. Deployed — but nowhere.</p>
          </article>
          <article class="compare-card accent-card">
            <h3>Hardware-aware home</h3>
            <p id="sdkWithLine">${plan
              ? `This host → <strong>${plan.device}/${plan.dtype}</strong>, ${plan.maxTokens} tokens. ${(plan.reasons ?? []).join(' · ')}`
              : '—'}</p>
          </article>
        </div>
      </section>

      <section class="section">
        <p class="section-kicker">Awareness stack</p>
        <div class="awareness-grid compact">
          ${HARDWARE_LAYERS.map((row) => `
            <div class="awareness-item">
              <span class="awareness-layer">${row.layer}</span>
              <p>${row.knows}</p>
            </div>
          `).join('')}
        </div>
        <div class="closing-cta">
          <button class="btn btn-primary interactive" data-nav="try">Try the Situated Agent MVP</button>
        </div>
      </section>
    </div>
  `;

  container.querySelectorAll('[data-nav]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('touchai:nav', { detail: { view: btn.dataset.nav } }));
    });
  });

  container.querySelectorAll('#sdkModelPick [data-model]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      modelId = btn.dataset.model;
      container.querySelectorAll('#sdkModelPick [data-model]').forEach((b) => {
        b.classList.toggle('active-chip', b.dataset.model === modelId);
      });
      plan = await adaptExecution(modelId, hw, caps);
      const panel = container.querySelector('#sdkPlanPanel');
      if (panel) panel.innerHTML = renderPlan(plan);
      const withLine = container.querySelector('#sdkWithLine');
      if (withLine) {
        withLine.innerHTML = `This machine → <strong>${plan.device}/${plan.dtype}</strong>, ${plan.maxTokens} tokens. ${(plan.reasons ?? []).map(esc).join(' · ')}`;
      }
    });
  });

  if (hw) renderAttestation(container.querySelector('#sdkAttest'), hw);
}

function renderPlan(plan) {
  return `
    <div class="adapt-row"><span>Device</span><span>${plan.device}</span></div>
    <div class="adapt-row"><span>Backend</span><span>${esc(plan.backend)}</span></div>
    <div class="adapt-row"><span>Dtype</span><span>${plan.dtype}</span></div>
    <div class="adapt-row"><span>Mode</span><span>${plan.mode}</span></div>
    <div class="adapt-row"><span>Tokens</span><span>${plan.maxTokens}</span></div>
    <div class="adapt-row"><span>Defer heavy</span><span>${plan.shouldDefer ? 'yes' : 'no'}</span></div>
    <code class="adapt-code">${formatAdaptPlan(plan)}</code>
    <p class="adapt-reasons">${(plan.reasons ?? []).map(esc).join(' · ')}</p>
  `;
}

async function renderAttestation(el, hw) {
  if (!el) return;
  const proof = await attestIntegrity(hw);
  el.innerHTML = `
    <div class="nav-label">attestIntegrity()</div>
    <div class="adapt-row"><span>deviceId</span><span>${proof.deviceId}</span></div>
    <div class="adapt-row"><span>signature</span><span class="mono-truncate">${proof.signature}</span></div>
  `;
}

function esc(t) {
  const s = document.createElement('span');
  s.textContent = t ?? '';
  return s.innerHTML;
}
