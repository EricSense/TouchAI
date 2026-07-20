import { runBootSequence } from './boot.js';
import { renderVisionView } from './vision.js';
import { renderSdkView } from './sdk.js';
import { renderDeviceView } from './device.js';
import { initDemo, mountDemoPanel, preloadDemoModel, getDemoStatus } from './demo.js';
import { initRipples } from './ripple.js';
import { initCursor } from './cursor.js';
import { focusLine, getViewLabel, focusScore } from './focus.js';
import { markJourneyStep, initJourney, renderJourneyStrip } from './onboarding.js';

let hardware = null;
let demoMounted = false;

const views = {
  vision: () => document.getElementById('viewVision'),
  sdk: () => document.getElementById('viewSdk'),
  device: () => document.getElementById('viewDevice'),
  live: () => document.getElementById('viewLive'),
};

const VALID = ['vision', 'sdk', 'device', 'live'];

function updateHash(view) {
  if (location.hash !== `#${view}`) location.hash = view;
}

function parseHash() {
  const view = location.hash.slice(1).split('/')[0];
  if (VALID.includes(view)) return { view };
  return { view: 'vision' };
}

function updateFocusBar(view, hw) {
  const bar = document.getElementById('focusBar');
  if (!bar) return;
  bar.querySelector('.focus-view').textContent = getViewLabel(view);
  bar.querySelector('.focus-device').textContent = focusLine(hw);
  const score = focusScore(view, hw);
  const badge = document.getElementById('runtimeBadge');
  if (badge && hw) badge.textContent = `${score.active}/${score.total} active`;
}

export function navigate(view) {
  if (!VALID.includes(view)) view = 'vision';

  document.querySelectorAll('.nav-link').forEach((l) => {
    l.classList.toggle('active', l.dataset.view === view);
  });

  VALID.forEach((id) => {
    const el = views[id]();
    if (el) el.classList.toggle('hidden', id !== view);
  });

  if (view === 'vision' && hardware) renderVisionView(views.vision(), hardware);
  if (view === 'sdk' && hardware) renderSdkView(views.sdk(), hardware);
  if (view === 'device' && hardware) renderDeviceView(views.device(), hardware);
  if (view === 'live') {
    const root = document.getElementById('demoRoot');
    if (!demoMounted && root) {
      mountDemoPanel(root);
      demoMounted = true;
    }
  }

  updateFocusBar(view, hardware);
  updateHash(view);
  markJourneyStep(view);
  renderJourneyStrip();
}

function initApp(hw) {
  hardware = hw;
  initDemo(hw);

  initCursor(document.getElementById('cursor'));
  initRipples(document.getElementById('rippleLayer'));
  initJourney();

  const sit = document.getElementById('navSituation');
  if (sit && hw) sit.textContent = `${hw.platform} · ${hw.layersActive}/${hw.layersTotal} layers`;
  updateFocusBar('vision', hw);

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
  document.getElementById('statusText').textContent = getDemoStatus(hw);

  navigate(parseHash().view);
}

runBootSequence(initApp);
