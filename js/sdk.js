import { PRODUCTS, SDK_API, HARDWARE_LAYERS, PILLARS } from './focus.js';
import {
  adaptExecution,
  formatAdaptPlan,
  attestIntegrity,
  detectCapabilities,
  SDK_VERSION,
} from 'touchai-sdk';
import { renderFocusCheck } from './focus-ui.js';

const product = () => PRODUCTS.find((p) => p.id === 'sdk');

export async function renderSdkView(container, hw) {
  const p = product();
  const caps = await detectCapabilities();
  const plan = hw ? await adaptExecution(hw.recommendedModel, hw, caps) : null;

  container.innerHTML = `
    <div class="product-view sdk-view">
      <section class="product-hero">
        <p class="brand-mark compact">TouchAI</p>
        <p class="section-kicker">${p.num} · Hardware-Aware AI SDK · v${SDK_VERSION}</p>
        <h1 class="product-hero-title">${p.title}</h1>
        <p class="product-hero-tag">${p.tagline}</p>
        <p class="product-hero-lead">${p.what}</p>
        <div class="hero-actions">
          <button class="btn btn-primary interactive" data-scroll="sdkInstall">Install</button>
          <button class="btn btn-ghost interactive" data-nav="use">Use it on this machine</button>
        </div>
      </section>

      <section class="section" id="sdkInstall">
        <p class="section-kicker">Install</p>
        <h2 class="section-title">Add Hardware-Aware AI to your app.</h2>
        <p class="section-lead">Package lives in this repo at <code>sdk/</code>. Install from GitHub or link locally.</p>
        <div class="install-block">
          <pre class="api-code"><code># local (from a clone of this repo)
npm install ./sdk

# or copy the sdk folder into your project and:
npm install ./touchai-sdk</code></pre>
          <pre class="api-code"><code>import {
  createTouchAI,
  scanHardware,
  detectCapabilities,
  adaptExecution,
  runInference,
} from 'touchai-sdk'

const touch = await createTouchAI()
console.log(touch.plan.device, touch.plan.dtype) // probed + adapted
const { response, plan } = await touch.runInference('What hardware am I on?')</code></pre>
        </div>
      </section>

      <section class="section" id="sdkApi">
        <p class="section-kicker">API</p>
        <h2 class="section-title">Hardware awareness, callable.</h2>
        <div class="api-grid">
          ${SDK_API.map((api) => `
            <article class="api-card">
              <div class="api-head">
                <code class="api-name">${api.name}</code>
                <span class="api-pillar">${pillarLabel(api.pillar)}</span>
              </div>
              <p>${api.desc}</p>
              <pre class="api-code"><code>${api.code}</code></pre>
            </article>
          `).join('')}
        </div>
      </section>

      <section class="section">
        <p class="section-kicker">Live on this browser</p>
        <h2 class="section-title">Real adapt plan — not a slide.</h2>
        <p class="section-lead">Capabilities probed on this machine, then honored by the runtime.</p>
        <div class="live-plan">
          <div class="live-plan-meta">
            <span>WebGPU · ${caps.webgpu ? 'yes' : 'no'}</span>
            <span>WASM · ${caps.wasm ? 'yes' : 'no'}</span>
            <span>WebNN · ${caps.webnn ? 'yes' : 'no'}</span>
          </div>
          ${plan ? renderLivePlan(hw, plan) : ''}
        </div>
        <div id="sdkAttest" class="attest-panel"></div>
        <div id="sdkFocusCheck"></div>
        <div class="closing-cta">
          <button class="btn btn-primary interactive" data-nav="use">Open Hardware-Aware AI</button>
        </div>
      </section>
    </div>
  `;

  container.querySelectorAll('[data-nav]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('touchai:nav', { detail: { view: btn.dataset.nav } }));
    });
  });

  container.querySelectorAll('[data-scroll]').forEach((btn) => {
    btn.addEventListener('click', () => {
      container.querySelector(`#${btn.dataset.scroll}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  renderFocusCheck(container.querySelector('#sdkFocusCheck'), 'sdk', hw);
  if (hw) renderAttestation(container.querySelector('#sdkAttest'), hw);
}

function pillarLabel(id) {
  return PILLARS.find((p) => p.id === id)?.label ?? id;
}

function renderLivePlan(hw, plan) {
  return `
      <div class="adapt-plan wide">
        <div class="adapt-row"><span>Device</span><span>${plan.device}</span></div>
        <div class="adapt-row"><span>Backend</span><span>${plan.backend}</span></div>
        <div class="adapt-row"><span>Dtype</span><span>${plan.dtype}</span></div>
        <div class="adapt-row"><span>Mode</span><span>${plan.mode}</span></div>
        <div class="adapt-row"><span>Tokens</span><span>${plan.maxTokens}</span></div>
        <div class="adapt-row"><span>Defer</span><span>${plan.shouldDefer ? 'yes' : 'no'}</span></div>
      </div>
      <code class="adapt-code">${formatAdaptPlan(plan)}</code>
      <p class="adapt-reasons">${(plan.reasons ?? []).join(' · ')}</p>
      <p class="platform-focus-line">${hw.platform} · ${hw.arch} · ${hw.cores ?? '?'} cores · ${hw.layersActive}/${hw.layersTotal} layers</p>
  `;
}

async function renderAttestation(el, hw) {
  if (!el) return;
  el.innerHTML = `<div class="nav-label">attestIntegrity()</div><p class="ctx-hint">Computing…</p>`;
  const proof = await attestIntegrity(hw);
  el.innerHTML = `
    <div class="nav-label">attestIntegrity()</div>
    <div class="adapt-plan wide">
      <div class="adapt-row"><span>deviceId</span><span>${proof.deviceId}</span></div>
      <div class="adapt-row"><span>enclave</span><span>${proof.enclave}</span></div>
      <div class="adapt-row"><span>signature</span><span class="mono-truncate">${proof.signature}</span></div>
      <div class="adapt-row"><span>layers</span><span>${proof.layers}</span></div>
    </div>
  `;
}
