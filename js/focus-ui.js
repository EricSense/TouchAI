import { PILLARS, assessFocus, focusScore } from './focus.js';
import { adaptExecution, formatAdaptPlan } from 'touchai-sdk';

export function renderFocusCheck(container, view, hw) {
  if (!container) return;
  const items = assessFocus(view, hw);
  const score = focusScore(view, hw);

  container.innerHTML = `
    <div class="focus-score">${score.active}/${score.total} commitments active${score.complete ? ' · in focus' : ''}</div>
    <div class="focus-check-grid">
      ${items.map((p) => `
        <div class="focus-check-item${p.active ? ' active' : ''}">
          <span class="focus-check-dot"></span>
          <span>${p.label}</span>
        </div>
      `).join('')}
    </div>
  `;
}

export async function renderAdaptPanel(container, hw, modelId) {
  if (!container || !hw) return;
  container.innerHTML = `<div class="nav-label">Hardware-aware execution</div><p class="ctx-hint">Probing…</p>`;
  const plan = await adaptExecution(modelId, hw);
  container.innerHTML = `
    <div class="nav-label">Hardware-aware execution</div>
    <div class="adapt-plan">
      <div class="adapt-row"><span>Device</span><span>${plan.device}</span></div>
      <div class="adapt-row"><span>Backend</span><span>${plan.backend}</span></div>
      <div class="adapt-row"><span>Dtype</span><span>${plan.dtype}</span></div>
      <div class="adapt-row"><span>Mode</span><span>${plan.mode}</span></div>
      <div class="adapt-row"><span>Tokens</span><span>${plan.maxTokens}</span></div>
      <div class="adapt-row"><span>Thermal</span><span>${plan.thermal}</span></div>
      <div class="adapt-row"><span>Power</span><span>${plan.powerBudget}</span></div>
    </div>
    <code class="adapt-code">${formatAdaptPlan(plan)}</code>
    <p class="adapt-reasons">${(plan.reasons ?? []).map((r) => esc(r)).join(' · ')}</p>
  `;
}

function esc(t) {
  const s = document.createElement('span');
  s.textContent = t;
  return s.innerHTML;
}
