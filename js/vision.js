import { THESIS, MVP, PRODUCTS, HARDWARE_LAYERS, FLOW, BRAND, focusLine } from './focus.js';
import { adaptExecution } from 'touchai-sdk';

export async function renderHomeView(container, hw) {
  const plan = hw ? await adaptExecution(hw.recommendedModel, hw) : null;
  const tryProduct = PRODUCTS.find((p) => p.id === 'try');
  const sdkProduct = PRODUCTS.find((p) => p.id === 'sdk');

  container.innerHTML = `
    <div class="vision-view startup-view">
      <section class="hero hero-full hero-startup">
        <div class="hero-atmosphere" aria-hidden="true">
          <div class="hero-grid"></div>
          <div class="hero-machine" id="heroMachine"></div>
          <div class="hero-glow"></div>
        </div>
        <div class="hero-copy">
          <p class="mvp-pill">${MVP.badge}</p>
          <p class="brand-mark">TouchAI</p>
          <h1 class="hero-title">Hardware-aware AI.</h1>
          <p class="hero-sub">${THESIS.opening} ${THESIS.depth}</p>
          <div class="hero-actions">
            <button class="btn btn-primary interactive" data-nav="try">Try the prototype</button>
            <button class="btn btn-ghost interactive" data-nav="sdk">Get the SDK</button>
          </div>
          ${hw && plan ? `
            <div class="hero-host">
              <span class="live-pill">This host</span>
              <span>${hw.platform} · ${plan.device}/${plan.dtype} · ${hw.layersActive}/${hw.layersTotal} layers</span>
            </div>
          ` : ''}
        </div>
      </section>

      <section class="section problem-section">
        <p class="section-kicker">The problem</p>
        <h2 class="section-title">Capability is a race to commodity.</h2>
        <div class="problem-stack">
          <p>${THESIS.problem}</p>
          <p class="problem-dest">${THESIS.destination}</p>
          <p class="problem-refusal">${THESIS.refusal}</p>
          <p class="section-promise">${THESIS.axis}</p>
          <p>${THESIS.promise}</p>
          <p class="home-answer">${THESIS.home}</p>
        </div>
      </section>

      <section class="section mvp-section">
        <p class="section-kicker">What ships in this MVP</p>
        <h2 class="section-title">A prototype you can use now.</h2>
        <p class="section-lead">${BRAND.company} This build is the working slice: situate a model on a real host and talk to a Situated Agent.</p>
        <div class="mvp-grid">
          <div class="mvp-col">
            <h3>In this prototype</h3>
            <ul class="mvp-list">
              ${MVP.ships.map((s) => `<li>${s}</li>`).join('')}
            </ul>
          </div>
          <div class="mvp-col muted-col">
            <h3>Not in MVP yet</h3>
            <ul class="mvp-list">
              ${MVP.notYet.map((s) => `<li>${s}</li>`).join('')}
            </ul>
          </div>
        </div>
        <div class="products-grid mvp-products">
          <article class="product-panel">
            <div class="product-head">
              <span class="product-num">${tryProduct.num}</span>
              <span class="product-audience">${tryProduct.audience}</span>
            </div>
            <h3>${tryProduct.title}</h3>
            <p class="product-tag">${tryProduct.tagline}</p>
            <p class="product-what">${tryProduct.what}</p>
            <button class="btn btn-primary interactive" data-nav="try">Open prototype</button>
          </article>
          <article class="product-panel">
            <div class="product-head">
              <span class="product-num">${sdkProduct.num}</span>
              <span class="product-audience">${sdkProduct.audience}</span>
            </div>
            <h3>${sdkProduct.title}</h3>
            <p class="product-tag">${sdkProduct.tagline}</p>
            <p class="product-what">${sdkProduct.what}</p>
            <button class="btn btn-ghost interactive" data-nav="sdk">Install SDK</button>
          </article>
        </div>
      </section>

      <section class="section awareness-section">
        <p class="section-kicker">How it works</p>
        <h2 class="section-title">Situation → adapt → run.</h2>
        <div class="flow-strip">
          ${FLOW.map((step, i) => `
            <span class="flow-step">${step}</span>
            ${i < FLOW.length - 1 ? '<span class="flow-arrow" aria-hidden="true">→</span>' : ''}
          `).join('')}
        </div>
        <div class="awareness-grid compact">
          ${HARDWARE_LAYERS.map((row) => `
            <div class="awareness-item">
              <span class="awareness-layer">${row.layer}</span>
              <p>${row.knows}</p>
            </div>
          `).join('')}
        </div>
        <p class="platform-focus-line">${focusLine(hw)}</p>
      </section>
    </div>
  `;

  paintHeroMachine(container.querySelector('#heroMachine'), hw);
  container.querySelectorAll('[data-nav]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('touchai:nav', { detail: { view: btn.dataset.nav } }));
    });
  });
}

function paintHeroMachine(el, hw) {
  if (!el) return;
  const cores = hw?.cores ?? 8;
  const nodes = Math.min(Math.max(cores, 4), 16);
  const rings = Array.from({ length: nodes }, (_, i) => {
    const a = (i / nodes) * Math.PI * 2;
    const r = 38 + (i % 3) * 10;
    const x = 50 + Math.cos(a) * r * 0.55;
    const y = 50 + Math.sin(a) * r * 0.38;
    return `<circle class="node" cx="${x}" cy="${y}" r="${2.2 + (i % 3) * 0.4}" style="--d:${i * 0.08}s"/>`;
  }).join('');

  el.innerHTML = `
    <svg viewBox="0 0 100 100" class="machine-svg" aria-hidden="true">
      <circle class="orbit orbit-a" cx="50" cy="50" r="34" fill="none"/>
      <circle class="orbit orbit-b" cx="50" cy="50" r="24" fill="none"/>
      <circle class="core" cx="50" cy="50" r="6"/>
      ${rings}
      <text x="50" y="92" text-anchor="middle" class="machine-label">${hw ? hw.platform : 'host'}</text>
    </svg>
  `;
}

export const renderVisionView = renderHomeView;
