import { CATEGORIES, totalCompanies } from './ecosystem.js';

export function renderPlatformView(container, hw) {
  container.innerHTML = `
    <div class="platform-view">
      <section class="hero">
        <div class="hero-eyebrow">The hardware-aware runtime for AI</div>
        <h1 class="hero-title">Every AI company builds for the cloud.<br/>TouchAI builds for the <em>device</em>.</h1>
        <p class="hero-sub">TouchAI is the infrastructure layer that lets foundation models, search tools, coding agents, robots, and creative AI run on the hardware they actually sit on — with zero egress, adaptive inference, and live device profiling.</p>
        <div class="hero-actions">
          <button class="btn btn-primary interactive" data-nav="demo">Try live demo</button>
          <button class="btn btn-ghost interactive" data-nav="solutions">Explore solutions</button>
        </div>
      </section>

      <section class="metrics-row">
        <div class="metric"><span class="metric-val">${CATEGORIES.length}</span><span class="metric-label">AI verticals</span></div>
        <div class="metric"><span class="metric-val">${totalCompanies()}</span><span class="metric-label">Companies served</span></div>
        <div class="metric"><span class="metric-val">0</span><span class="metric-label">Bytes egress</span></div>
        <div class="metric"><span class="metric-val">${hw?.cores ?? '—'}</span><span class="metric-label">Cores detected</span></div>
      </section>

      <section class="thesis-section">
        <blockquote>
          Every AI product today assumes cloud-first: type a prompt, wait for a server, hope your data stays private.
          <strong>Nobody is building AI that knows the hardware it runs on.</strong>
        </blockquote>
      </section>

      <section class="layer-section">
        <h2 class="section-title">Where TouchAI sits</h2>
        <div class="stack-diagram">
          <div class="stack-row muted">Application layer · OpenAI, Harvey, Runway, Cursor…</div>
          <div class="stack-row muted">Model layer · GPT, Claude, Mistral, Llama…</div>
          <div class="stack-row accent">TouchAI runtime · hardware scan · inference routing · zero egress</div>
          <div class="stack-row muted">Silicon · NPU · GPU · CPU · ${hw ? hw.platform + ' ' + hw.arch : 'your device'}</div>
        </div>
      </section>

      <section class="category-preview">
        <h2 class="section-title">One runtime. Every vertical.</h2>
        <div class="category-grid" id="categoryPreview"></div>
      </section>

      <section class="company-section">
        <h2 class="section-title">The business</h2>
        <div class="company-grid">
          <div class="company-block">
            <h3>What we sell</h3>
            <p>TouchAI is runtime infrastructure — not another chatbot. We license the hardware-aware layer to AI companies that need on-device deployment without rebuilding for every chip.</p>
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
    card.dataset.category = cat.id;
    card.innerHTML = `
      <span class="cat-count">${cat.companies.length} companies</span>
      <span class="cat-name">${cat.name}</span>
      <span class="cat-tag">${cat.tagline}</span>
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
