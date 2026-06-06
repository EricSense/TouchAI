import { runBootSequence } from './boot.js';
import { renderPlatformView } from './platform.js';
import { renderSolutionsView } from './solutions.js';
import { initDemo, mountDemoPanel, setDemoContext, preloadDemoModel, getDemoStatus, getDemoContext } from './demo.js';
import { initRipples } from './ripple.js';
import { initCursor } from './cursor.js';
import { totalCompanies, getCompanyBySlug, slugify } from './ecosystem.js';
import { focusLine } from './focus.js';
import { markJourneyStep, initJourney, renderJourneyStrip } from './onboarding.js';

let hardware = null;
let demoMounted = false;

const views = {
  platform: document.getElementById('viewPlatform'),
  solutions: document.getElementById('viewSolutions'),
  demo: document.getElementById('viewDemo'),
};

function updateHash(view, opts = {}) {
  let hash = view;
  if (view === 'solutions' && opts.category) hash += `/${opts.category}`;
  if (view === 'demo') {
    if (opts.company && opts.category) hash += `/${opts.category}/${slug(opts.company)}`;
    else if (opts.category) hash += `/${opts.category}`;
  }
  if (location.hash !== `#${hash}`) location.hash = hash;
}

function slug(name) {
  return slugify(name);
}

function parseHash() {
  const parts = location.hash.slice(1).split('/').filter(Boolean);
  if (!parts.length) return { view: 'platform' };
  const view = parts[0];
  if (view === 'solutions') return { view: 'solutions', category: parts[1] };
  if (view === 'demo') {
    const category = parts[1];
    const co = parts[2] && category ? getCompanyBySlug(category, parts[2]) : null;
    return { view: 'demo', category, company: co?.name };
  }
  if (['platform', 'solutions', 'demo'].includes(view)) return { view };
  return { view: 'platform' };
}

function updateFocusBar(view, hw) {
  const bar = document.getElementById('focusBar');
  if (!bar) return;
  const labels = { platform: 'Platform · thesis & stack', solutions: 'Solutions · 7 verticals · 34 companies', demo: 'Live Demo · on-device inference' };
  bar.querySelector('.focus-view').textContent = labels[view] ?? '';
  bar.querySelector('.focus-device').textContent = focusLine(hw);
}

export function navigate(view, opts = {}) {
  document.querySelectorAll('.nav-link').forEach((l) => {
    l.classList.toggle('active', l.dataset.view === view);
  });
  Object.entries(views).forEach(([id, el]) => {
    if (el) el.classList.toggle('hidden', id !== view);
  });

  if (view === 'platform' && hardware) renderPlatformView(views.platform, hardware);
  if (view === 'solutions') renderSolutionsView(views.solutions, opts.category);
  if (view === 'demo') {
    const root = document.getElementById('demoRoot');
    if (opts.category || opts.company) setDemoContext(opts.category, opts.company);
    if (!demoMounted && root) {
      mountDemoPanel(root);
      demoMounted = true;
    } else if (opts.category || opts.company) {
      setDemoContext(opts.category, opts.company);
    }
  }

  const ctx = getDemoContext();
  document.getElementById('demoVerticalBadge')?.classList.toggle('hidden', view !== 'demo' || !ctx.company);
  updateFocusBar(view, hardware);
  updateHash(view, opts);
  markJourneyStep(view);
  renderJourneyStrip();
}

function initApp(hw) {
  hardware = hw;
  initDemo(hw);

  initCursor(document.getElementById('cursor'));
  initRipples(document.getElementById('rippleLayer'));
  initJourney();

  document.getElementById('navCompanyCount').textContent = `${totalCompanies()} AI companies`;
  updateFocusBar('platform', hw);

  document.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => navigate(link.dataset.view));
  });

  document.addEventListener('touchai:nav', (e) => navigate(e.detail.view, e.detail));

  document.addEventListener('touchai:vertical', (e) => {
    setDemoContext(e.detail.category);
  });

  window.addEventListener('hashchange', () => {
    const route = parseHash();
    navigate(route.view, route);
  });

  preloadDemoModel((msg) => {
    document.getElementById('statusText').textContent = msg;
  }).then(() => {
    document.getElementById('statusText').textContent = getDemoStatus(hw);
  });

  const route = parseHash();
  navigate(route.view, route);
}

runBootSequence(initApp);
