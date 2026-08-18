import { createForge } from '../engine/index.js';
import { ALLOCATOR, OPERATOR } from '../data/seed.js';
import { loadState, resetState, saveState } from '../store.js';
import { formatUsd } from '../format.js';
import { renderThesis } from './views/thesis.js';
import { renderLoop } from './views/loop.js';
import { renderProblems } from './views/problems.js';
import { renderMarket } from './views/market.js';
import { renderVentures } from './views/ventures.js';
import { renderCapital } from './views/capital.js';
import { renderRisk } from './views/risk.js';

const VIEWS = ['thesis', 'loop', 'problems', 'market', 'ventures', 'capital', 'risk'];

const NAV = [
  ['thesis', 'Thesis'],
  ['loop', 'Loop'],
  ['problems', 'Problems'],
  ['market', 'Market'],
  ['ventures', 'Ventures'],
  ['capital', 'Capital'],
  ['risk', 'Risk'],
];

const MARK = `<svg class="mark" viewBox="0 0 32 32" aria-hidden="true"><rect x="6" y="18" width="20" height="8" rx="1" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10 18 L16 8 L22 18" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="16" cy="14" r="2.2" fill="currentColor"/></svg>`;

let forge = null;
let root = null;
let toastTimer = null;

function viewFromHash() {
  const raw = location.hash.slice(1).split('/')[0];
  return VIEWS.includes(raw) ? raw : 'thesis';
}

function render() {
  const view = viewFromHash();
  const state = forge.getState();
  const pool = state.pool;

  const body = {
    thesis: renderThesis,
    loop: renderLoop,
    problems: renderProblems,
    market: renderMarket,
    ventures: renderVentures,
    capital: renderCapital,
    risk: renderRisk,
  }[view](state);

  root.innerHTML = `
    <aside class="rail">
      <a class="brand" href="#thesis">${MARK}<span>FORGE</span></a>
      <p class="brand-line">the capital that builds its own startups</p>
      <nav>
        ${NAV.map(
          ([id, label]) =>
            `<a href="#${id}" class="${id === view ? 'active' : ''}">${label}</a>`,
        ).join('')}
      </nav>
      <div class="rail-foot">
        <p>Phase 1 · manual loop</p>
        <p>B2B ops automation</p>
        <p>${OPERATOR.name} operates · ${ALLOCATOR.name} is liable</p>
        <button type="button" class="btn btn-ghost btn-small" data-action="reset">Reset pilot</button>
      </div>
    </aside>
    <div class="workspace">
      <header class="ticker">
        <span>Pool ${formatUsd(pool.committed)}</span>
        <span>Powder ${formatUsd(pool.available)}</span>
        <span>Allocated ${formatUsd(pool.allocated)}</span>
        <span>Returned ${formatUsd(pool.returned)}</span>
        <span>Spread ${formatUsd(pool.spreadEarned)}</span>
        <span>Fees ${formatUsd(pool.platformFees)}</span>
      </header>
      <main id="main">${body}</main>
    </div>
    <div id="modal" class="modal hidden" hidden></div>
    <div id="toast" class="toast hidden" hidden></div>
  `;
}

function persist() {
  saveState(forge.getState());
}

function showToast(message, kind = 'ok') {
  const el = document.getElementById('toast');
  if (!el) return;
  el.hidden = false;
  el.className = `toast toast-${kind}`;
  el.textContent = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.hidden = true;
    el.classList.add('hidden');
  }, 3200);
}

function openModal({ title, body, confirmLabel, onConfirm }) {
  const modal = document.getElementById('modal');
  modal.hidden = false;
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-card">
      <h2>${title}</h2>
      <p>${body}</p>
      <p class="warn">This action is signed by ${ALLOCATOR.name}, allocator. Phase 1 treats that person as liable.</p>
      <div class="cta-row">
        <button type="button" class="btn btn-ghost" data-close-modal>Cancel</button>
        <button type="button" class="btn btn-ember" data-confirm-modal>${confirmLabel}</button>
      </div>
    </div>
  `;
  modal.querySelector('[data-close-modal]').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  modal.querySelector('[data-confirm-modal]').addEventListener('click', async () => {
    closeModal();
    await onConfirm();
  });
}

function closeModal() {
  const modal = document.getElementById('modal');
  modal.hidden = true;
  modal.className = 'modal hidden';
  modal.innerHTML = '';
}

function formData(form) {
  return Object.fromEntries(new FormData(form).entries());
}

async function handleAction(action, dataset) {
  try {
    if (action === 'reset') {
      if (!confirm('Reset the pilot to the seeded B2B ops loop?')) return;
      forge.setState(await resetState());
      render();
      showToast('Pilot reset to seed');
      return;
    }
    if (action === 'post') {
      forge.postProblem(dataset.id, OPERATOR);
      persist();
      render();
      showToast('Problem posted — bidding is open');
      return;
    }
    if (action === 'award') {
      openModal({
        title: 'Award execution rights',
        body: 'Capital will follow this bid if you instantiate next. This is not equity. It is a priced claim on verified outcomes.',
        confirmLabel: 'I am the allocator — award',
        onConfirm: () => {
          forge.awardBid({ problemId: dataset.id, bidId: dataset.bid }, ALLOCATOR);
          persist();
          location.hash = 'market';
          render();
          showToast('Bid awarded. Instantiate the shell.');
        },
      });
      return;
    }
    if (action === 'instantiate') {
      openModal({
        title: 'Instantiate a disposable venture',
        body: 'A contractor-only shell will be formed, capital and a platform fee drawn from the pool, and a dissolve date set. No cap table is created.',
        confirmLabel: 'I am the allocator — instantiate',
        onConfirm: () => {
          const venture = forge.instantiateVenture({ problemId: dataset.id }, ALLOCATOR);
          persist();
          location.hash = 'ventures';
          render();
          showToast(`${venture.name} is live`);
        },
      });
      return;
    }
    if (action === 'dissolve') {
      openModal({
        title: 'Dissolve the shell',
        body: 'The obligation ends with the outcome stream. Remaining outstanding capital is written down. There is no residual company.',
        confirmLabel: 'I am the allocator — dissolve',
        onConfirm: () => {
          const { writeDown } = forge.dissolveVenture(
            { ventureId: dataset.id, reason: 'Allocator ended the stream' },
            ALLOCATOR,
          );
          persist();
          render();
          showToast(`Dissolved. Write-down ${formatUsd(writeDown)}`);
        },
      });
    }
  } catch (err) {
    showToast(err.message, 'fail');
  }
}

async function handleForm(form) {
  const kind = form.dataset.form;
  const data = formData(form);
  try {
    if (kind === 'detect') {
      forge.ingestSignal(
        {
          cluster: data.cluster,
          title: data.title,
          summary: data.summary,
          source: data.source,
          excerpt: data.summary,
          weight: Number(data.weight),
        },
        OPERATOR,
      );
      persist();
      render();
      showToast('Signal clustered');
      return;
    }
    if (kind === 'size') {
      forge.sizeProblem(
        form.dataset.id,
        {
          frequencyPerMonth: Number(data.frequencyPerMonth),
          severityUsd: Number(data.severityUsd),
        },
        OPERATOR,
      );
      persist();
      render();
      showToast('Problem sized and priced');
      return;
    }
    if (kind === 'bid') {
      forge.submitBid(
        {
          problemId: form.dataset.id,
          bidder: {
            name: data.name,
            type: data.type,
            credibility: Number(data.credibility),
          },
          capitalAsk: Number(data.capitalAsk),
          shareRate: Number(data.shareRate),
          timelineWeeks: Number(data.timelineWeeks),
          plan: data.plan,
          planQuality: 0.65,
        },
        OPERATOR,
      );
      persist();
      render();
      showToast('Bid scored and posted');
      return;
    }
    if (kind === 'outcome') {
      await forge.recordOutcome(
        {
          ventureId: form.dataset.id,
          type: data.type,
          quantity: Number(data.quantity),
          unitValue: Number(data.unitValue),
          source: data.source,
        },
        OPERATOR,
      );
      persist();
      render();
      showToast('Outcome attested and settled');
    }
  } catch (err) {
    showToast(err.message, 'fail');
  }
}

function bind() {
  root.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    handleAction(btn.dataset.action, btn.dataset);
  });
  root.addEventListener('submit', (e) => {
    const form = e.target.closest('form[data-form]');
    if (!form) return;
    e.preventDefault();
    handleForm(form);
  });
  window.addEventListener('hashchange', render);
}

export async function mount(el) {
  root = el;
  const state = await loadState();
  forge = createForge(state);
  bind();
  render();
}
