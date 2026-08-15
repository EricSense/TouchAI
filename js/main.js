import { runBootSequence } from './boot.js';
import { renderVisionView } from './vision.js';
import { renderSdkView } from './sdk.js';
import { initDemo, mountDemoPanel, preloadDemoModel, getDemoStatus } from './demo.js';
import { initRipples } from './ripple.js';
import { initCursor } from './cursor.js';
import { focusLine, getViewLabel } from './focus.js';
import { adaptExecution, formatAdaptPlan } from 'touchai-sdk';

let hardware = null;
let productMounted = false;

const views = {
  use: () => document.getElementById('viewUse'),
  sdk: () => document.getElementById('viewSdk'),
  why: () => document.getElementById('viewWhy'),
};

const VALID = ['use', 'sdk', 'why'];

function updateHash(view) {
  if (location.hash !== `#${view}`) location.hash = view;
}

function parseHash() {
  const raw = location.hash.slice(1).split('/')[0];
  // Legacy deep links
  if (raw === 'live' || raw === 'device' || raw === 'vision') return { view: raw === 'vision' ? 'why' : 'use' };
  if (VALID.includes(raw)) return { view: raw };
  return { view: 'use' };
}

async function updateStatusStrip(view, hw) {
  const label = document.getElementById('statusStripLabel');
  const detail = document.getElementById('statusStripDetail');
  const badge = document.getElementById('runtimeBadge');
  if (label) label.textContent = getViewLabel(view);
  if (detail) detail.textContent = focusLine(hw);
  if (badge && hw) {
    const plan = await adaptExecution(hw.recommendedModel, hw);
    badge.textContent = `${plan.device} · ${plan.dtype}`;
    const deviceBadge = document.getElementById('deviceBadge');
    if (deviceBadge) deviceBadge.textContent = plan.device;
  }
}

export function navigate(view) {
  if (!VALID.includes(view)) view = 'use';

  document.querySelectorAll('.nav-link').forEach((l) => {
    l.classList.toggle('active', l.dataset.view === view);
  });

  VALID.forEach((id) => {
    const el = views[id]();
    if (el) el.classList.toggle('hidden', id !== view);
  });

  if (view === 'use') {
    const root = document.getElementById('demoRoot');
    if (!productMounted && root) {
      mountDemoPanel(root);
      productMounted = true;
    }
  }
  if (view === 'sdk' && hardware) renderSdkView(views.sdk(), hardware);
  if (view === 'why' && hardware) renderVisionView(views.why(), hardware);

  updateStatusStrip(view, hardware);
  updateHash(view);
}

async function initApp(hw) {
  hardware = hw;
  initDemo(hw);

  initCursor(document.getElementById('cursor'));
  initRipples(document.getElementById('rippleLayer'));

  const sit = document.getElementById('navSituation');
  if (sit && hw) {
    const plan = await adaptExecution(hw.recommendedModel, hw);
    sit.textContent = `${hw.platform} · ${plan.device}/${plan.dtype}`;
    document.getElementById('statusText').textContent =
      `${getDemoStatus(hw)} · ${formatAdaptPlan(plan)}`;
  }

  document.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => navigate(link.dataset.view));
  });

  document.querySelectorAll('[data-nav]').forEach((btn) => {
    btn.addEventListener('click', () => navigate(btn.dataset.nav));
  });

  document.addEventListener('touchai:nav', (e) => navigate(e.detail.view));

  window.addEventListener('hashchange', () => {
    navigate(parseHash().view);
  });

  preloadDemoModel((msg) => {
    const el = document.getElementById('statusText');
    if (el) el.textContent = msg;
  });

  navigate(parseHash().view);
}

runBootSequence(initApp);
