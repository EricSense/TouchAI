import { CATEGORIES, getCategory, totalCompanies, searchCompanies } from './ecosystem.js';
import { THESIS } from './focus.js';

let activeCategory = 'foundation';
let searchQuery = '';
let mounted = false;

export function getActiveVertical() {
  return getCategory(activeCategory);
}

export function renderSolutionsView(container, categoryId) {
  if (categoryId) activeCategory = categoryId;

  if (!mounted) {
    container.innerHTML = buildShell();
    wireShellEvents(container);
    renderComparisonMatrix(container.querySelector('#matrixSection'));
    mounted = true;
  }

  updateNav(container);
  renderDetail(container.querySelector('#verticalDetail'), getCategory(activeCategory));
  renderSearchResults(container);
}

function buildShell() {
  return `
    <div class="solutions-view">
      <header class="view-header solutions-header">
        <div class="solutions-header-top">
          <div>
            <h1>Solutions</h1>
            <p>How TouchAI applies across ${CATEGORIES.length} AI verticals and ${totalCompanies()} companies — ${THESIS.insight.toLowerCase()}</p>
          </div>
          <div class="solutions-search-wrap">
            <input type="search" id="solutionsSearch" class="solutions-search interactive" placeholder="Search companies…" aria-label="Search companies" />
          </div>
        </div>
        <div class="ecosystem-strip" id="ecosystemStrip"></div>
        <div class="matrix-section" id="matrixSection"></div>
      </header>

      <select id="verticalSelect" class="vertical-select interactive" aria-label="Select vertical"></select>

      <div class="solutions-layout">
        <nav class="vertical-nav" id="verticalNav" aria-label="AI verticals"></nav>
        <div class="vertical-detail" id="verticalDetail"></div>
      </div>

      <div id="searchResults" class="search-results hidden"></div>
    </div>
  `;
}

function wireShellEvents(container) {
  const search = container.querySelector('#solutionsSearch');
  search?.addEventListener('input', () => {
    searchQuery = search.value;
    renderSearchResults(container);
  });

  const select = container.querySelector('#verticalSelect');
  select?.addEventListener('change', () => {
    activeCategory = select.value;
    searchQuery = '';
    if (search) search.value = '';
    updateNav(container);
    renderDetail(container.querySelector('#verticalDetail'), getCategory(activeCategory));
    container.querySelector('#searchResults')?.classList.add('hidden');
    container.querySelector('.solutions-layout')?.classList.remove('hidden');
  });
}

function updateNav(container) {
  const strip = container.querySelector('#ecosystemStrip');
  const nav = container.querySelector('#verticalNav');
  const select = container.querySelector('#verticalSelect');

  if (strip) {
    strip.innerHTML = CATEGORIES.map((cat) => `
      <button class="eco-chip interactive${cat.id === activeCategory ? ' active' : ''}" data-id="${cat.id}">
        <span class="eco-chip-count">${cat.companies.length}</span>
        <span class="eco-chip-name">${shortName(cat.name)}</span>
      </button>
    `).join('');

    strip.querySelectorAll('.eco-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        activeCategory = chip.dataset.id;
        searchQuery = '';
        const search = container.querySelector('#solutionsSearch');
        if (search) search.value = '';
        updateNav(container);
        renderDetail(container.querySelector('#verticalDetail'), getCategory(activeCategory));
        container.querySelector('#searchResults')?.classList.add('hidden');
        container.querySelector('.solutions-layout')?.classList.remove('hidden');
      });
    });
  }

  if (nav) {
    nav.innerHTML = CATEGORIES.map((cat) => `
      <button class="vertical-tab interactive${cat.id === activeCategory ? ' active' : ''}" data-id="${cat.id}">
        <span class="vt-name">${cat.name}</span>
        <span class="vt-count">${cat.companies.length}</span>
      </button>
    `).join('');

    nav.querySelectorAll('.vertical-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeCategory = btn.dataset.id;
        searchQuery = '';
        const search = container.querySelector('#solutionsSearch');
        if (search) search.value = '';
        updateNav(container);
        renderDetail(container.querySelector('#verticalDetail'), getCategory(activeCategory));
        document.dispatchEvent(new CustomEvent('touchai:vertical', { detail: { category: activeCategory } }));
      });
    });
  }

  if (select) {
    select.innerHTML = CATEGORIES.map((cat) =>
      `<option value="${cat.id}"${cat.id === activeCategory ? ' selected' : ''}>${cat.name}</option>`,
    ).join('');
  }
}

function shortName(name) {
  return name.split('&')[0].trim().split(' ').slice(0, 2).join(' ');
}

function renderDetail(el, cat) {
  if (!el) return;

  el.innerHTML = `
    <div class="vd-header">
      <h2>${cat.name}</h2>
      <p class="vd-tagline">${cat.tagline}</p>
    </div>

    <div class="vd-metrics">
      ${Object.entries(cat.metrics).map(([k, v]) => `
        <div class="vd-metric"><span class="vd-metric-k">${k}</span><span class="vd-metric-v">${v}</span></div>
      `).join('')}
    </div>

    <div class="vd-contrast">
      <div class="vd-contrast-col cloud">
        <span class="vd-contrast-label">Without TouchAI</span>
        <p>${cat.cloudProblem}</p>
      </div>
      <div class="vd-contrast-col touchai">
        <span class="vd-contrast-label">With TouchAI</span>
        <p>${cat.touchaiGain}</p>
      </div>
    </div>

    <div class="vd-flow">
      <span class="vd-role-label">Integration flow</span>
      <div class="flow-steps">
        ${cat.integrationFlow.map((step, i) => `
          <span class="flow-step">${step}</span>
          ${i < cat.integrationFlow.length - 1 ? '<span class="flow-arrow">→</span>' : ''}
        `).join('')}
      </div>
    </div>

    <div class="vd-capabilities">
      ${cat.capabilities.map((c) => `<span class="cap-chip">${c}</span>`).join('')}
    </div>

    <div class="vd-role">
      <span class="vd-role-label">TouchAI runtime role</span>
      <p>${cat.touchaiRole}</p>
    </div>

    <div class="vd-companies-header">
      <span class="vd-role-label">${cat.companies.length} companies in this vertical</span>
    </div>

    <div class="company-grid">
      ${cat.companies.map((co) => renderCompanyCard(co, cat.id)).join('')}
    </div>
  `;

  el.querySelectorAll('.co-demo-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      document.dispatchEvent(new CustomEvent('touchai:nav', {
        detail: { view: 'demo', category: btn.dataset.category, company: btn.dataset.company },
      }));
    });
  });
}

function renderCompanyCard(co, categoryId) {
  return `
    <article class="company-card interactive">
      <div class="co-header">
        <div class="co-name">${co.name}</div>
        <span class="co-badge">Partner fit</span>
      </div>
      <div class="co-problem">
        <span class="co-label">Cloud problem</span>
        <p>${co.problem}</p>
      </div>
      <div class="co-solution">
        <span class="co-label co-label-accent">TouchAI layer</span>
        <p>${co.touchai}</p>
      </div>
      <p class="co-fit">${co.fit}</p>
      <button class="co-demo-btn interactive" data-company="${co.name}" data-category="${categoryId}">
        Demo on your hardware →
      </button>
    </article>
  `;
}

function renderSearchResults(container) {
  const panel = container.querySelector('#searchResults');
  const layout = container.querySelector('.solutions-layout');
  if (!panel) return;

  const results = searchCompanies(searchQuery);

  if (!searchQuery.trim()) {
    panel.classList.add('hidden');
    layout?.classList.remove('hidden');
    return;
  }

  layout?.classList.add('hidden');
  panel.classList.remove('hidden');

  if (!results?.length) {
    panel.innerHTML = `<p class="search-empty">No companies match "${esc(searchQuery)}"</p>`;
    return;
  }

  panel.innerHTML = `
    <div class="search-results-header">
      <span>${results.length} result${results.length === 1 ? '' : 's'} for "${esc(searchQuery)}"</span>
    </div>
    <div class="company-grid">
      ${results.map((co) => `
        <article class="company-card interactive">
          <div class="co-header">
            <div class="co-name">${co.name}</div>
            <span class="co-vertical-tag">${co.categoryName}</span>
          </div>
          <div class="co-problem"><span class="co-label">Cloud problem</span><p>${co.problem}</p></div>
          <div class="co-solution"><span class="co-label co-label-accent">TouchAI layer</span><p>${co.touchai}</p></div>
          <button class="co-demo-btn interactive" data-company="${co.name}" data-category="${co.categoryId}">Demo on your hardware →</button>
        </article>
      `).join('')}
    </div>
  `;

  panel.querySelectorAll('.co-demo-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('touchai:nav', {
        detail: { view: 'demo', category: btn.dataset.category, company: btn.dataset.company },
      }));
    });
  });
}

function renderComparisonMatrix(el) {
  if (!el) return;

  el.innerHTML = `
    <div class="matrix-header">
      <span class="vd-role-label">Vertical comparison</span>
      <button type="button" class="matrix-toggle interactive" id="matrixToggle" aria-expanded="false">Show matrix</button>
    </div>
    <div class="matrix-wrap hidden" id="matrixWrap">
      <table class="matrix-table">
        <thead>
          <tr>
            <th>Vertical</th>
            <th>Cos</th>
            <th>Latency</th>
            <th>Egress</th>
            <th>Top capability</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${CATEGORIES.map((cat) => `
            <tr class="matrix-row interactive" data-id="${cat.id}">
              <td><strong>${shortVerticalName(cat.name)}</strong><span class="matrix-tag">${cat.tagline}</span></td>
              <td>${cat.companies.length}</td>
              <td>${cat.metrics.latency}</td>
              <td class="matrix-zero">${cat.metrics.egress}</td>
              <td>${cat.capabilities[0]}</td>
              <td><span class="matrix-link">Explore →</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  const toggle = el.querySelector('#matrixToggle');
  const wrap = el.querySelector('#matrixWrap');
  toggle?.addEventListener('click', () => {
    wrap.classList.toggle('hidden');
    const isHidden = wrap.classList.contains('hidden');
    toggle.textContent = isHidden ? 'Show matrix' : 'Hide matrix';
    toggle.setAttribute('aria-expanded', String(!isHidden));
  });

  el.querySelectorAll('.matrix-row').forEach((row) => {
    row.addEventListener('click', () => {
      activeCategory = row.dataset.id;
      const container = document.getElementById('viewSolutions');
      if (container) {
        updateNav(container);
        renderDetail(container.querySelector('#verticalDetail'), getCategory(activeCategory));
        container.querySelector('.solutions-layout')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

function shortVerticalName(name) {
  if (name.includes('Foundation')) return 'Foundation Models';
  if (name.includes('Infrastructure')) return 'Infrastructure';
  if (name.includes('Productivity')) return 'Search & Productivity';
  if (name.includes('Coding')) return 'AI Coding';
  if (name.includes('Robotics')) return 'Robotics';
  if (name.includes('Healthcare')) return 'Healthcare';
  if (name.includes('Creative')) return 'Creative AI';
  return name.split(' ')[0];
}

function esc(text) {
  const s = document.createElement('span');
  s.textContent = text;
  return s.innerHTML;
}
