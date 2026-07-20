import { THESIS, MARKET, PRODUCTS, PILLARS, HARDWARE_LAYERS, FLOW, focusLine } from './focus.js';
import { renderFocusCheck } from './focus-ui.js';

export function renderVisionView(container, hw) {
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
          <p class="hero-sub">Situational intelligence — not smarter models. Deep knowledge of the hardware every AI runs on.</p>
          <div class="hero-actions">
            <button class="btn btn-primary interactive" data-nav="live">Run on this machine</button>
            <button class="btn btn-ghost interactive" data-nav="sdk">Explore the SDK</button>
          </div>
        </div>
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
        <h2 class="section-title">${THESIS.axis}</h2>
        <p class="section-lead">${THESIS.question}</p>
        <p class="section-promise">${THESIS.promise}</p>
        ${hw ? renderLiveSituation(hw) : ''}
      </section>

      <section class="section market-section">
        <p class="section-kicker">The market</p>
        <h2 class="section-title">Value is shifting to deployment.</h2>
        <p class="section-lead">${MARKET.opening}</p>
        <p class="market-position">${MARKET.position}</p>
        <div class="stack-diagram">
          <div class="stack-row muted">Application layer · assistants, agents, apps</div>
          <div class="stack-row muted">Model layer · foundation models (commoditizing)</div>
          <div class="stack-row accent">TouchAI · situational intelligence · hardware-aware deployment</div>
          <div class="stack-row muted">Silicon · NPU · GPU · CPU · ${hw ? `${hw.platform} ${hw.arch}` : 'your device'}</div>
        </div>
      </section>

      <section class="section pillars-section">
        <p class="section-kicker">What we build toward</p>
        <h2 class="section-title">Three commitments.</h2>
        <div class="pillars-grid">
          ${PILLARS.map((p, i) => `
            <article class="pillar-block">
              <span class="pillar-num">0${i + 1}</span>
              <h3>${p.label}</h3>
              <p>${p.desc}</p>
            </article>
          `).join('')}
        </div>
      </section>

      <section class="section awareness-section">
        <p class="section-kicker">What hardware-aware means</p>
        <h2 class="section-title">Eight layers of situation.</h2>
        <p class="section-lead">Not “runs on device.” A live understanding of the machine — this moment, this context.</p>
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

      <section class="section products-section">
        <p class="section-kicker">Product roadmap</p>
        <h2 class="section-title">Two products. One axis.</h2>
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
              <button class="btn btn-ghost interactive" data-nav="${p.view}">Open ${p.title.split(' ').pop()}</button>
            </article>
          `).join('')}
        </div>
      </section>

      <section class="section focus-check-section">
        <p class="section-kicker">Built in focus</p>
        <h2 class="section-title">Live on this device.</h2>
        <div id="visionFocusCheck"></div>
        <div class="closing-cta">
          <button class="btn btn-primary interactive" data-nav="live">Prove it on your hardware</button>
          <button class="btn btn-ghost interactive" data-nav="device">Meet the Situated Agent</button>
        </div>
      </section>
    </div>
  `;

  paintHeroMachine(container.querySelector('#heroMachine'), hw);

  container.querySelectorAll('[data-nav]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('touchai:nav', { detail: { view: btn.dataset.nav } }));
    });
  });

  renderFocusCheck(container.querySelector('#visionFocusCheck'), 'vision', hw);
}

function renderLiveSituation(hw) {
  return `
    <div class="live-situation">
      <span class="live-pill">Live on this machine</span>
      <div class="live-situation-grid">
        ${(hw.layers ?? []).slice(0, 4).map((l) => `
          <div class="live-situation-item"><span>${l.name}</span><strong>${l.summary}</strong></div>
        `).join('')}
      </div>
    </div>
  `;
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
      <text x="50" y="92" text-anchor="middle" class="machine-label">${hw ? hw.platform : 'device'}</text>
    </svg>
  `;
}
