import { CATEGORIES, totalCompanies } from './ecosystem.js';
import {
  THESIS, PILLARS, FLOW, focusLine, FOCUS_CHECKLIST,
  HARDWARE_LAYERS, PRODUCT_SURFACES, PLATFORM_WINS, MOAT,
} from './focus.js';
import { renderRuntimeSection } from './runtime.js';

export function renderPlatformView(container, hw) {
  container.innerHTML = `
    <div class="platform-view">
      <section class="hero">
        <div class="hero-eyebrow">The hardware-aware AI runtime</div>
        <h1 class="hero-title">The layer between every AI model<br/>and every machine on earth.</h1>
        <p class="hero-sub">${THESIS.promise}</p>
        <div class="hero-actions">
          <button class="btn btn-primary interactive" data-nav="demo">Run on your hardware</button>
          <button class="btn btn-ghost interactive" data-nav="solutions">Explore verticals</button>
        </div>
      </section>

      <section class="metrics-row">
        <div class="metric"><span class="metric-val">${PRODUCT_SURFACES.length}</span><span class="metric-label">Product surfaces</span></div>
        <div class="metric"><span class="metric-val">${HARDWARE_LAYERS.length}</span><span class="metric-label">Awareness layers</span></div>
        <div class="metric"><span class="metric-val">${totalCompanies()}</span><span class="metric-label">AI companies served</span></div>
        <div class="metric"><span class="metric-val">${hw?.cores ?? '—'}</span><span class="metric-label">Cores on this device</span></div>
      </section>

      ${hw ? renderHardwareCard(hw) : ''}

      <section class="thesis-section">
        <blockquote>
          ${THESIS.founding}
          <strong>${THESIS.bet}</strong>
          ${THESIS.insight}
        </blockquote>
      </section>

      <section class="analogy-section">
        <h2 class="section-title">The analogy stack</h2>
        <p class="section-sub">Every era has a layer that won. AI inference is next.</p>
        <div class="analogy-table-wrap">
          <table class="analogy-table">
            <thead>
              <tr><th>Era</th><th>Layer that won</th><th>Who owned it</th></tr>
            </thead>
            <tbody>
              ${PLATFORM_WINS.map((row) => `
                <tr class="${row.owner === 'TouchAI' ? 'analogy-highlight' : ''}">
                  <td>${row.era}</td>
                  <td>${row.layer}</td>
                  <td><strong>${row.owner}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>

      <section class="awareness-section">
        <h2 class="section-title">What hardware-aware actually means</h2>
        <p class="section-sub">Not just "runs on device." A live, dynamic understanding of the machine — this moment, this context.</p>
        <div class="awareness-grid">
          ${HARDWARE_LAYERS.map((row) => `
            <div class="awareness-card">
              <span class="awareness-layer">${row.layer}</span>
              <p>${row.knows}</p>
            </div>
          `).join('')}
        </div>
      </section>

      <section class="pillars-section">
        <h2 class="section-title">Three pillars — everything we build serves these</h2>
        <div class="pillars-grid">
          ${PILLARS.map((p, i) => `
            <div class="pillar-card">
              <span class="pillar-num">0${i + 1}</span>
              <h3>${p.label}</h3>
              <p>${p.desc}</p>
            </div>
          `).join('')}
        </div>
      </section>

      <section class="surfaces-section">
        <h2 class="section-title">Five product surfaces</h2>
        <p class="section-sub">From SDK to OEM to industrial OS — one runtime, multiple go-to-market paths.</p>
        <div class="surfaces-grid">
          ${PRODUCT_SURFACES.map((s) => `
            <article class="surface-card">
              <div class="surface-head">
                <span class="surface-num">${s.num}</span>
                <span class="surface-tag">${s.tagline}</span>
              </div>
              <h3>${s.title}</h3>
              <p class="surface-desc">${s.desc}</p>
              <p class="surface-buyers"><span>Who pays</span> ${s.buyers}</p>
            </article>
          `).join('')}
        </div>
      </section>

      <section class="layer-section">
        <h2 class="section-title">Where TouchAI sits</h2>
        <div class="stack-diagram">
          <div class="stack-row muted">Application layer · OpenAI, Harvey, Runway, Cursor…</div>
          <div class="stack-row muted">Model layer · GPT, Claude, Mistral, Llama…</div>
          <div class="stack-row accent">TouchAI runtime · hardware scan · adaptive execution · situated inference</div>
          <div class="stack-row muted">Silicon · NPU · GPU · CPU · ${hw ? hw.platform + ' ' + hw.arch : 'your device'}</div>
        </div>
        <div class="vd-flow platform-flow">
          <span class="vd-role-label">How it works on ${hw ? hw.platform : 'your device'}</span>
          <div class="flow-steps">
            ${FLOW.map((step, i) => `
              <span class="flow-step">${step}</span>
              ${i < FLOW.length - 1 ? '<span class="flow-arrow">→</span>' : ''}
            `).join('')}
          </div>
          <p class="platform-focus-line">${focusLine(hw)}</p>
        </div>
      </section>

      <section class="category-preview">
        <h2 class="section-title">One runtime. Every vertical.</h2>
        <p class="section-sub">Each vertical has hardware gaps, integration flows, and company-specific TouchAI capabilities — explore in Solutions.</p>
        <div class="category-grid" id="categoryPreview"></div>
      </section>

      ${renderRuntimeSection()}

      <section class="moat-section">
        <h2 class="section-title">The competitive moat</h2>
        <div class="moat-grid">
          ${MOAT.map((m) => `
            <div class="moat-card">
              <h3>${m.title}</h3>
              <p>${m.desc}</p>
            </div>
          `).join('')}
        </div>
      </section>

      <section class="focus-check-section">
        <h2 class="section-title">Built in focus</h2>
        <p class="section-sub">Every feature maps to a pillar — if it doesn't, it doesn't ship.</p>
        <div class="focus-check-grid">
          ${FOCUS_CHECKLIST.map((label) => `<div class="focus-check-item"><span class="focus-check-dot"></span>${label}</div>`).join('')}
        </div>
      </section>

      <section class="company-section">
        <h2 class="section-title">The business</h2>
        <div class="company-grid">
          <div class="company-block">
            <h3>What we sell</h3>
            <p>The hardware-aware runtime layer — not another chatbot. Infrastructure that makes any AI model work optimally on any physical machine.</p>
          </div>
          <div class="company-block">
            <h3>Who pays</h3>
            <ul class="company-list">
              <li><strong>AI companies</strong> — Runtime SDK integration</li>
              <li><strong>Device OEMs</strong> — Pre-installed runtime licensing</li>
              <li><strong>Industrial & defense</strong> — Edge OS enterprise contracts</li>
              <li><strong>Regulated enterprises</strong> — Trust & identity layer</li>
              <li><strong>Power users</strong> — Situated AI agent subscription</li>
            </ul>
          </div>
          <div class="company-block">
            <h3>Why now</h3>
            <p>Every device ships with an NPU. Every AI company ships models trained in the cloud. Nobody owns the layer that connects them on real hardware — yet.</p>
          </div>
        </div>
        <div class="company-cta">
          <button class="btn btn-primary interactive" data-nav="demo">Run on your hardware</button>
          <a class="btn btn-ghost interactive" href="https://github.com/EricSense/TouchAI" target="_blank" rel="noopener">View source</a>
        </div>
      </section>
    </div>
  `;

  const grid = container.querySelector('#categoryPreview');
  for (const cat of CATEGORIES) {
    const card = document.createElement('button');
    card.className = 'category-card interactive';
    card.innerHTML = `
      <span class="cat-count">${cat.companies.length} companies</span>
      <span class="cat-name">${cat.name}</span>
      <span class="cat-tag">${cat.tagline}</span>
      <span class="cat-caps">${cat.capabilities.slice(0, 2).join(' · ')}</span>
    `;
    card.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('touchai:nav', { detail: { view: 'solutions', category: cat.id } }));
    });
    grid.appendChild(card);
  }

  container.querySelectorAll('[data-nav]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('touchai:nav', { detail: { view: btn.dataset.nav } }));
    });
  });
}

function renderHardwareCard(hw) {
  const layerRows = hw.layers?.map((l) => `
    <div class="platform-hw-item"><span>${l.name}</span><span>${l.summary}</span></div>
  `).join('') ?? '';

  return `
    <section class="platform-hw">
      <h2 class="section-title">Live on this device · ${hw.layersActive}/${hw.layersTotal} awareness layers</h2>
      <div class="platform-hw-grid">
        ${layerRows}
        <div class="platform-hw-item"><span>Runtime</span><span class="hw-accent">${hw.inferenceBackend}</span></div>
      </div>
    </section>
  `;
}
