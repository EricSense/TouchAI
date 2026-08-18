import { JOURNEY } from './focus.js';

const KEY = 'touchai-journey-v2';

function loadVisited() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? {};
  } catch {
    return {};
  }
}

let visited = loadVisited();

export function markJourneyStep(view) {
  if (!JOURNEY.some((j) => j.view === view)) return;
  visited[view] = true;
  localStorage.setItem(KEY, JSON.stringify(visited));
  renderJourneyStrip();
}

export function isJourneyComplete() {
  return JOURNEY.every((j) => visited[j.view]);
}

export function getJourneyState() {
  return { visited: { ...visited }, complete: isJourneyComplete() };
}

export function renderJourneyStrip() {
  const el = document.getElementById('journeyStrip');
  if (!el) return;

  if (isJourneyComplete()) {
    el.classList.add('hidden');
    return;
  }

  el.classList.remove('hidden');
  const done = JOURNEY.filter((j) => visited[j.view]).length;

  el.innerHTML = `
    <div class="journey-label">Focus path · ${done}/${JOURNEY.length}</div>
    <div class="journey-steps">
      ${JOURNEY.map((j) => `
        <button type="button" class="journey-step interactive${visited[j.view] ? ' done' : ''}${!visited[j.view] && done === j.step - 1 ? ' next' : ''}" data-view="${j.view}">
          <span class="journey-check">${visited[j.view] ? '✓' : j.step}</span>
          <span class="journey-text">
            <span class="journey-title">${j.title}</span>
            <span class="journey-desc">${j.desc}</span>
          </span>
        </button>
      `).join('')}
    </div>
    <button type="button" class="journey-dismiss interactive" aria-label="Dismiss">×</button>
  `;

  el.querySelectorAll('.journey-step').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('touchai:nav', { detail: { view: btn.dataset.view } }));
    });
  });

  el.querySelector('.journey-dismiss')?.addEventListener('click', () => {
    JOURNEY.forEach((j) => { visited[j.view] = true; });
    localStorage.setItem(KEY, JSON.stringify(visited));
    el.classList.add('hidden');
  });
}

export function initJourney() {
  renderJourneyStrip();
}
