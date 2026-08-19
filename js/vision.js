import { THESIS, HOME, MARKET, PRODUCTS, HARDWARE_LAYERS, FLOW, BRAND, focusLine } from './focus.js';
import { adaptExecution } from 'touchai-sdk';

export async function renderHomeView(container, hw) {
  const plan = hw ? await adaptExecution(hw.recommendedModel, hw) : null;

  container.innerHTML = `
    <div class="vision-view">
      <section class="hero hero-full">
        <div class="hero-atmosphere" aria-hidden="true">
          <div class="hero-grid"></div>
          <div class="hero-machine" id="heroMachine"></div>
          <div class="hero-glow"></div>
        </div>
        <div class="hero-copy">
          <p class="brand-mark">TouchAI</p>
          <h1 class="hero-title">Hardware-aware AI.</h1>
          <p class="hero-sub">A deep relationship between AI models and their physical host machines.</p>
          <div class="hero-actions">
            <button class="btn btn-primary interactive" data-nav="sdk">TouchAI SDK</button>
            <button class="btn btn-ghost interactive" data-nav="device">TouchAI Device</button>
          </div>
        </div>
      </section>

      <section class="section opening-section">
        <p class="section-kicker">What we’re building</p>
        <h2 class="section-title">Infrastructure for hardware-intelligent AI.</h2>
        <p class="section-lead">${THESIS.opening}</p>
        <p class="company-line">${BRAND.company}</p>
      </section>

      <section class="section problem-section">
        <p class="section-kicker">The problem with how AI is positioned today</p>
        <h2 class="section-title">Capability is a race to commodity.</h2>
        <div class="problem-stack">
          <p>${THESIS.problem}</p>
          <p class="problem-dest">${THESIS.destination}</p>
          <p class="problem-refusal">${THESIS.refusal}</p>
        </div>
      </section>

      <section class="section axis-section">
        <p class="section-kicker">A different axis</p>
        <h2 class="section-title">Situational intelligence.</h2>
        <p class="section-lead">${THESIS.axis}</p>
        <p class="section-promise">${THESIS.question}</p>
        <p class="section-lead">${THESIS.promise}</p>
        ${hw && plan ? `
          <div class="live-situation">
            <span class="live-pill">This host · right now</span>
            <div class="live-situation-grid">
              <div class="live-situation-item"><span>Platform</span><strong>${hw.platform} · ${hw.arch}</strong></div>
              <div class="live-situation-item"><span>Adapted path</span><strong>${plan.device} / ${plan.dtype}</strong></div>
              <div class="live-situation-item"><span>Layers</span><strong>${hw.layersActive}/${hw.layersTotal}</strong></div>
              <div class="live-situation-item"><span>Power</span><strong>${hw.awareness.power.level}</strong></div>
            </div>
          </div>
        ` : ''}
      </section>

      <section class="section home-section">
        <p class="section-kicker">What it means for AI to know its hardware</p>
        <h2 class="section-title">Every model is homeless. TouchAI gives it a home.</h2>
        <div class="home-stack">
          <p>${HOME.homeless}</p>
          <p class="home-answer">${HOME.home}</p>
        </div>
        <div class="scale-depth">
          <div class="scale-depth-card">
            <span class="scale-depth-label">Scale</span>
            <p>The cloud solved scale.</p>
          </div>
          <div class="scale-depth-card accent">
            <span class="scale-depth-label">Depth</span>
            <p>TouchAI is solving depth.</p>
          </div>
        </div>
        <p class="depth-line">${HOME.depth}</p>
      </section>

      <section class="section market-section">
        <p class="section-kicker">The market</p>
        <h2 class="section-title">Value is shifting to deployment.</h2>
        <p class="section-lead">${MARKET.opening}</p>
        <p class="market-position">${MARKET.position}</p>
        <div class="stack-diagram">
          <div class="stack-row muted">Application layer · assistants, agents, apps</div>
          <div class="stack-row muted">Model layer · foundation models (commoditizing)</div>
          <div class="stack-row accent">TouchAI · hardware-aware infrastructure · depth</div>
          <div class="stack-row muted">Host · NPU · GPU · CPU · ${hw ? `${hw.platform} ${hw.arch}` : 'your machine'}</div>
        </div>
      </section>

      <section class="section products-section">
        <p class="section-kicker">Products</p>
        <h2 class="section-title">Two products. One relationship.</h2>
        <div class="products-grid">
          ${PRODUCTS.map((p) => `
            <article class="product-panel">
              <div class="product-head">
                <span class="product-num">${p.num}</span>
                <span class="product-audience">${p.audience}</span>
              </div>
              <h3>${p.title}</h3>
              <p class="product-tag">${p.tagline}</p>
              <p class="product-what">${p.what}</p>
              <p class="product-does">${p.does}</p>
              ${p.arc ? `<p class="product-does">${p.arc}</p>` : ''}
              <button class="btn btn-ghost interactive" data-nav="${p.view}">Open ${p.title}</button>
            </article>
          `).join('')}
        </div>
      </section>

      <section class="section awareness-section">
        <p class="section-kicker">What hardware-aware means</p>
        <h2 class="section-title">Eight layers of situation.</h2>
        <div class="awareness-grid">
          ${HARDWARE_LAYERS.map((row) => `
            <div class="awareness-item">
              <span class="awareness-layer">${row.layer}</span>
              <p>${row.knows}</p>
            </div>
          `).join('')}
        </div>
        <div class="flow-strip">
          ${FLOW.map((step, i) => `
            <span class="flow-step">${step}</span>
            ${i < FLOW.length - 1 ? '<span class="flow-arrow" aria-hidden="true">→</span>' : ''}
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

/** @deprecated alias */
export const renderVisionView = renderHomeView;
