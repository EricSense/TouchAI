import { WHAT, HOW, THESIS, MVP, PRODUCTS, HARDWARE_LAYERS, focusLine } from './focus.js';
import { adaptExecution, recommendAssistant } from 'touchai-sdk';

export async function renderHomeView(container, hw) {
  const plan = hw ? await adaptExecution(hw.recommendedModel, hw) : null;
  const route = hw && plan ? recommendAssistant(hw, plan) : null;

  container.innerHTML = `
    <div class="vision-view rebuild-view">
      <section class="hero hero-full hero-startup">
        <div class="hero-atmosphere" aria-hidden="true">
          <div class="hero-grid"></div>
          <div class="hero-machine" id="heroMachine"></div>
          <div class="hero-glow"></div>
        </div>
        <div class="hero-copy">
          <p class="mvp-pill">${MVP.badge}</p>
          <p class="brand-mark">TouchAI</p>
          <h1 class="hero-title">${WHAT.headline}</h1>
          <p class="hero-sub">${WHAT.body}</p>
          <div class="hero-actions">
            <button class="btn btn-primary interactive" data-nav="try">See it on this host</button>
            <button class="btn btn-ghost interactive" data-nav="sdk">Get the SDK</button>
          </div>
          ${hw && plan && route ? `
            <div class="hero-host">
              <span class="live-pill">Live on this host</span>
              <span>${hw.platform} · ${plan.device}/${plan.dtype} · route ${route.name}</span>
            </div>
          ` : ''}
        </div>
      </section>

      <section class="section what-section" id="what">
        <p class="section-kicker">What TouchAI does</p>
        <h2 class="section-title">Hardware-aware AI for every model.</h2>
        <p class="section-lead">${WHAT.body}</p>
        <ul class="what-list">
          ${WHAT.bullets.map((b) => `<li>${b}</li>`).join('')}
        </ul>
        <div class="thesis-box">
          <p>${THESIS.problem}</p>
          <p class="section-promise">${THESIS.axis}</p>
          <p class="home-answer">${THESIS.home}</p>
          <p>${THESIS.depth}</p>
        </div>
      </section>

      <section class="section how-section" id="how">
        <p class="section-kicker">How TouchAI works</p>
        <h2 class="section-title">Scan → Adapt → Route → Run → Remember.</h2>
        <p class="section-lead">One pipeline. Same on the prototype and in the SDK.</p>
        <ol class="how-steps">
          ${HOW.map((h) => `
            <li class="how-step">
              <span class="how-num">${h.step}</span>
              <div>
                <h3>${h.title}</h3>
                <p>${h.detail}</p>
              </div>
            </li>
          `).join('')}
        </ol>
        <div class="flow-strip">
          ${HOW.map((h, i) => `
            <span class="flow-step">${h.title}</span>
            ${i < HOW.length - 1 ? '<span class="flow-arrow" aria-hidden="true">→</span>' : ''}
          `).join('')}
        </div>
      </section>

      <section class="section layers-section">
        <p class="section-kicker">What “scan” reads</p>
        <h2 class="section-title">Eight layers of situation.</h2>
        <div class="awareness-grid compact">
          ${HARDWARE_LAYERS.map((row) => `
            <div class="awareness-item">
              <span class="awareness-layer">${row.layer}</span>
              <p>${row.knows}</p>
            </div>
          `).join('')}
        </div>
      </section>

      <section class="section mvp-section">
        <p class="section-kicker">Prototype</p>
        <h2 class="section-title">Use it on this machine.</h2>
        <ul class="mvp-list single">
          ${MVP.ships.map((s) => `<li>${s}</li>`).join('')}
        </ul>
        <div class="products-grid mvp-products">
          ${PRODUCTS.map((p) => `
            <article class="product-panel">
              <div class="product-head">
                <span class="product-num">${p.num}</span>
                <span class="product-audience">${p.audience}</span>
              </div>
              <h3>${p.title}</h3>
              <p class="product-tag">${p.tagline}</p>
              <p class="product-what">${p.what}</p>
              <button class="btn ${p.id === 'try' ? 'btn-primary' : 'btn-ghost'} interactive" data-nav="${p.view}">
                ${p.id === 'try' ? 'Open prototype' : 'Open SDK'}
              </button>
            </article>
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
