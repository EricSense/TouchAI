import { CATEGORIES, totalCompanies } from './ecosystem.js';
import { THESIS, PILLARS, FLOW, focusLine } from './focus.js';

export function renderPlatformView(container, hw) {
  container.innerHTML = `
    <div class="platform-view">
      <section class="hero">
        <div class="hero-eyebrow">The hardware-aware runtime for AI</div>
        <h1 class="hero-title">Every AI company builds for the cloud.<br/>TouchAI builds for the <em>device</em>.</h1>
        <p class="hero-sub">${THESIS.promise}</p>
        <div class="hero-actions">
          <button class="btn btn-primary interactive" data-nav="demo">Try live demo</button>
          <button class="btn btn-ghost interactive" data-nav="solutions">Explore solutions</button>
        </div>
      </section>

      <section class="metrics-row">
        <div class="metric"><span class="metric-val">${CATEGORIES.length}</span><span class="metric-label">AI verticals</span></div>
        <div class="metric"><span class="metric-val">${totalCompanies()}</span><span class="metric-label">Companies served</span></div>
        <div class="metric"><span class="metric-val">0</span><span class="metric-label">Bytes egress</span></div>
        <div class="metric"><span class="metric-val">${hw?.cores ?? '—'}</span><span class="metric-label">Cores on this device</span></div>
      </section>

      ${hw ? renderHardwareCard(hw) : ''}

      <section class="thesis-section">
        <blockquote>
          ${THESIS.problem}
          <strong>${THESIS.insight}</strong>
        </blockquote>
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

      <section class="layer-section">
        <h2 class="section-title">Where TouchAI sits</h2>
        <div class="stack-diagram">
          <div class="stack-row muted">Application layer · OpenAI, Harvey, Runway, Cursor…</div>
          <div class="stack-row muted">Model layer · GPT, Claude, Mistral, Llama…</div>
          <div class="stack-row accent">TouchAI runtime · hardware scan · inference routing · zero egress</div>
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
        <p class="section-sub">Each vertical has cloud problems, integration flows, and company-specific TouchAI layers — explore in Solutions.</p>
        <div class="category-grid" id="categoryPreview"></div>
      </section>

      <section class="company-section">
        <h2 class="section-title">The business</h2>
        <div class="company-grid">
          <div class="company-block">
            <h3>What we sell</h3>
            <p>Runtime infrastructure — not another chatbot. The hardware-aware layer AI companies embed for on-device deployment.</p>
          </div>
          <div class="company-block">
            <h3>Who pays</h3>
            <ul class="company-list">
              <li><strong>Foundation model cos</strong> — edge deployment SDK</li>
              <li><strong>Enterprise AI</strong> — air-gapped, zero-egress inference</li>
              <li><strong>Device OEMs</strong> — pre-installed NPU-aware runtime</li>
            </ul>
          </div>
          <div class="company-block">
            <h3>Why now</h3>
            <p>Every phone, laptop, and robot ships with an NPU. Every AI company still routes inference to a datacenter. TouchAI closes that gap.</p>
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
  return `
    <section class="platform-hw">
      <h2 class="section-title">Live on this device</h2>
      <div class="platform-hw-grid">
        <div class="platform-hw-item"><span>Platform</span><span>${hw.platform}</span></div>
        <div class="platform-hw-item"><span>Architecture</span><span>${hw.arch}</span></div>
        <div class="platform-hw-item"><span>CPU</span><span>${hw.cores ?? '?'} cores</span></div>
        <div class="platform-hw-item"><span>RAM</span><span>${hw.ram}</span></div>
        <div class="platform-hw-item"><span>GPU</span><span>${hw.gpu}</span></div>
        <div class="platform-hw-item"><span>NPU</span><span>${hw.npu}</span></div>
        <div class="platform-hw-item"><span>Form factor</span><span>${hw.formFactor}</span></div>
        <div class="platform-hw-item"><span>Network</span><span class="hw-zero">0 bytes egress</span></div>
      </div>
    </section>
  `;
}
