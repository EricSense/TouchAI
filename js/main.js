import { runBootSequence } from './boot.js';
import { renderHomeView } from './vision.js';
import { renderSdkView } from './sdk.js';
import { initDemo, mountDemoPanel, preloadDemoModel, getDemoStatus } from './demo.js';
import { initRipples } from './ripple.js';
import { initCursor } from './cursor.js';
import { focusLine, getViewLabel } from './focus.js';
import { adaptExecution } from 'touchai-sdk';

let hardware = null;
let deviceMounted = false;

const views = {
  home: () => document.getElementById('viewHome'),
  sdk: () => document.getElementById('viewSdk'),
  device: () => document.getElementById('viewDevice'),
};

const VALID = ['home', 'sdk', 'device'];

function updateHash(view) {
  if (location.hash !== `#${view}`) location.hash = view;
}

function parseHash() {
  const raw = location.hash.slice(1).split('/')[0];
  const aliases = {
    vision: 'home', why: 'home', use: 'device', live: 'device',
  };
  const view = aliases[raw] ?? raw;
  if (VALID.includes(view)) return { view };
  return { view: 'home' };
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
  if (!VALID.includes(view)) view = 'home';

  document.querySelectorAll('.nav-link').forEach((l) => {
    l.classList.toggle('active', l.dataset.view === view);
  });

  VALID.forEach((id) => {
    const el = views[id]();
    if (el) el.classList.toggle('hidden', id !== view);
  });

  if (view === 'home' && hardware) renderHomeView(views.home(), hardware);
  if (view === 'sdk' && hardware) renderSdkView(views.sdk(), hardware);
  if (view === 'device') {
    const root = document.getElementById('demoRoot');
    if (!deviceMounted && root) {
      mountDemoPanel(root);
      deviceMounted = true;
    }
  }

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
    sit.textContent = `${hw.platform} · ${plan.device}`;
  }
  document.getElementById('statusText').textContent = getDemoStatus(hw);

  document.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => navigate(link.dataset.view));
  });
  document.querySelectorAll('[data-nav]').forEach((btn) => {
    btn.addEventListener('click', () => navigate(btn.dataset.nav));
  });
  document.addEventListener('touchai:nav', (e) => navigate(e.detail.view));
  window.addEventListener('hashchange', () => navigate(parseHash().view));

  preloadDemoModel((msg) => {
    const el = document.getElementById('statusText');
    if (el) el.textContent = msg;
  });

  navigate(parseHash().view);
}

runBootSequence(initApp);
