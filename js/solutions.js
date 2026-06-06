import { CATEGORIES, getCategory } from './ecosystem.js';

let activeCategory = 'foundation';

export function getActiveVertical() {
  return getCategory(activeCategory);
}

export function renderSolutionsView(container, categoryId) {
  if (categoryId) activeCategory = categoryId;

  container.innerHTML = `
    <div class="solutions-view">
      <header class="view-header">
        <h1>Solutions</h1>
        <p>How TouchAI applies across ${CATEGORIES.length} AI verticals and ${CATEGORIES.reduce((n, c) => n + c.companies.length, 0)} companies building the future of AI.</p>
      </header>

      <div class="solutions-layout">
        <nav class="vertical-nav" id="verticalNav"></nav>
        <div class="vertical-detail" id="verticalDetail"></div>
      </div>
    </div>
  `;

  const nav = container.querySelector('#verticalNav');
  for (const cat of CATEGORIES) {
    const btn = document.createElement('button');
    btn.className = `vertical-tab interactive${cat.id === activeCategory ? ' active' : ''}`;
    btn.dataset.id = cat.id;
    btn.innerHTML = `<span class="vt-name">${cat.name}</span><span class="vt-count">${cat.companies.length}</span>`;
    btn.addEventListener('click', () => {
      activeCategory = cat.id;
      renderSolutionsView(container);
      document.dispatchEvent(new CustomEvent('touchai:vertical', { detail: { category: cat.id } }));
    });
    nav.appendChild(btn);
  }

  renderVerticalDetail(container.querySelector('#verticalDetail'), getCategory(activeCategory));
}

function renderVerticalDetail(el, cat) {
  el.innerHTML = `
    <div class="vd-header">
      <h2>${cat.name}</h2>
      <p class="vd-tagline">${cat.tagline}</p>
    </div>
    <div class="vd-role">
      <span class="vd-role-label">TouchAI role</span>
      <p>${cat.touchaiRole}</p>
    </div>
    <div class="company-grid">
      ${cat.companies.map((co) => `
        <div class="company-card interactive" data-company="${co.name}">
          <div class="co-name">${co.name}</div>
          <div class="co-fit">${co.fit}</div>
          <button class="co-demo-btn interactive" data-company="${co.name}" data-category="${cat.id}">Demo on your hardware →</button>
        </div>
      `).join('')}
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
