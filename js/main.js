import { runBootSequence } from './boot.js';
import { renderPlatformView } from './platform.js';
import { renderSolutionsView } from './solutions.js';
import { initDemo, mountDemoPanel, setDemoContext, preloadDemoModel, getDemoStatus, getDemoContext } from './demo.js';
import { initRipples } from './ripple.js';
import { initCursor } from './cursor.js';
import { totalCompanies } from './ecosystem.js';

let hardware = null;
let currentView = 'platform';
let demoMounted = false;

const views = {
  platform: document.getElementById('viewPlatform'),
  solutions: document.getElementById('viewSolutions'),
  demo: document.getElementById('viewDemo'),
};

function navigate(view, opts = {}) {
  currentView = view;
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
  document.getElementById('demoVerticalBadge')?.classList.toggle(
    'hidden',
    view !== 'demo' || !ctx.company,
  );
}

function initApp(hw) {
  hardware = hw;
  initDemo(hw);

  initCursor(document.getElementById('cursor'));
  initRipples(document.getElementById('rippleLayer'));

  document.getElementById('navCompanyCount').textContent = `${totalCompanies()} AI companies`;

  document.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => navigate(link.dataset.view));
  });

  document.addEventListener('touchai:nav', (e) => {
    navigate(e.detail.view, e.detail);
  });

  document.addEventListener('touchai:vertical', (e) => {
    setDemoContext(e.detail.category);
  });

  preloadDemoModel((msg) => {
    document.getElementById('statusText').textContent = msg;
  }).then(() => {
    document.getElementById('statusText').textContent = getDemoStatus(hw);
  });

  navigate('platform');
}

runBootSequence(initApp);
