import { PRODUCTS, SDK_API, HARDWARE_LAYERS, PILLARS } from './focus.js';
import { adaptExecution, formatAdaptPlan, attestIntegrity } from './runtime-api.js';
import { renderFocusCheck } from './focus-ui.js';

const product = () => PRODUCTS.find((p) => p.id === 'sdk');

export function renderSdkView(container, hw) {
  const p = product();
  const plan = hw ? adaptExecution(hw.recommendedModel, hw) : null;

  container.innerHTML = `
    <div class="product-view sdk-view">
      <section class="product-hero">
        <p class="brand-mark compact">TouchAI</p>
        <p class="section-kicker">${p.num} · ${p.audience}</p>
        <h1 class="product-hero-title">${p.title}</h1>
        <p class="product-hero-tag">${p.tagline}</p>
        <p class="product-hero-lead">${p.what}</p>
        <div class="hero-actions">
          <button class="btn btn-primary interactive" data-nav="live">Try hardware-aware inference</button>
          <button class="btn btn-ghost interactive" data-scroll="sdkApi">See the API</button>
        </div>
      </section>

      <section class="section">
        <p class="section-kicker">What it does</p>
        <h2 class="section-title">The interface for hardware awareness.</h2>
        <p class="section-lead">${p.does}</p>
        <div class="sdk-value-grid">
          <article class="sdk-value">
            <h3>For model builders</h3>
            <p>Ship once. TouchAI situates your model on whatever silicon it lands on — phone, laptop, edge box.</p>
          </article>
          <article class="sdk-value">
            <h3>For app developers</h3>
            <p>Stop guessing device capability. Scan, adapt, and run with a live profile of the machine underneath.</p>
          </article>
          <article class="sdk-value">
            <h3>For the deployment layer</h3>
            <p>As foundation models commoditize, the durable product is the layer that makes them work on real hardware.</p>
          </article>
        </div>
      </section>

      <section class="section" id="sdkApi">
        <p class="section-kicker">SDK surface</p>
        <h2 class="section-title">Four calls. Full situation.</h2>
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
        <p class="section-kicker">Live adaptation</p>
        <h2 class="section-title">Already running on this browser.</h2>
        <p class="section-lead">The SDK is not a slide. Below is a real <code>adaptExecution()</code> plan for your machine.</p>
        ${hw && plan ? renderLivePlan(hw, plan) : '<p class="section-lead">Hardware scan pending…</p>'}
        <div id="sdkAttest" class="attest-panel"></div>
      </section>

      <section class="section">
        <p class="section-kicker">Awareness stack</p>
        <h2 class="section-title">What the SDK exposes.</h2>
        <div class="awareness-grid compact">
          ${HARDWARE_LAYERS.map((row) => `
            <div class="awareness-item">
              <span class="awareness-layer">${row.layer}</span>
              <p>${row.knows}</p>
            </div>
          `).join('')}
        </div>
        <div id="sdkFocusCheck"></div>
        <div class="closing-cta">
          <button class="btn btn-primary interactive" data-nav="device">Next: TouchAI Device</button>
          <button class="btn btn-ghost interactive" data-nav="live">Open Live demo</button>
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
    <div class="live-plan">
      <div class="live-plan-meta">
        <span>${hw.platform} · ${hw.arch}</span>
        <span>${hw.cores ?? '?'} cores · ${hw.ram}</span>
        <span>${hw.layersActive}/${hw.layersTotal} layers</span>
      </div>
      <div class="adapt-plan wide">
        <div class="adapt-row"><span>Backend</span><span>${plan.backend}</span></div>
        <div class="adapt-row"><span>Quant</span><span>${plan.quant}</span></div>
        <div class="adapt-row"><span>Mode</span><span>${plan.mode}</span></div>
        <div class="adapt-row"><span>Tokens</span><span>${plan.maxTokens}</span></div>
        <div class="adapt-row"><span>Latency</span><span>${plan.latencyTarget}</span></div>
        <div class="adapt-row"><span>Thermal</span><span>${plan.thermal}</span></div>
        <div class="adapt-row"><span>Power</span><span>${plan.powerBudget}</span></div>
      </div>
      <code class="adapt-code">${formatAdaptPlan(plan)}</code>
    </div>
  `;
}

async function renderAttestation(el, hw) {
  if (!el) return;
  el.innerHTML = `<div class="nav-label">attestIntegrity()</div><p class="ctx-hint">Computing hardware-rooted proof…</p>`;
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
