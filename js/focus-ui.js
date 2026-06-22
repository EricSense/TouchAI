import { PILLARS, assessFocus, focusScore, getVerticalFocus } from './focus.js';
import { adaptExecution, formatAdaptPlan } from './runtime-api.js';

export function renderFocusCheck(container, view, hw) {
  if (!container) return;
  const items = assessFocus(view, hw);
  const score = focusScore(view, hw);

  container.innerHTML = `
    <div class="focus-score">${score.active}/${score.total} pillars active${score.complete ? ' · in focus' : ''}</div>
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

export function renderPillarStrip(container) {
  if (!container) return;
  container.innerHTML = `
    <div class="pillar-strip">
      ${PILLARS.map((p, i) => `
        <span class="pillar-strip-item"><em>0${i + 1}</em> ${p.label}</span>
      `).join('<span class="pillar-strip-sep">·</span>')}
    </div>
  `;
}

export function renderAdaptPanel(container, hw, modelId) {
  if (!container || !hw) return;
  const plan = adaptExecution(modelId, hw);
  container.innerHTML = `
    <div class="nav-label">Adaptive execution</div>
    <div class="adapt-plan">
      <div class="adapt-row"><span>Backend</span><span>${plan.backend}</span></div>
      <div class="adapt-row"><span>Quant</span><span>${plan.quant}</span></div>
      <div class="adapt-row"><span>Mode</span><span>${plan.mode}</span></div>
      <div class="adapt-row"><span>Tokens</span><span>${plan.maxTokens}</span></div>
      <div class="adapt-row"><span>Latency</span><span>${plan.latencyTarget}</span></div>
      <div class="adapt-row"><span>Thermal</span><span>${plan.thermal}</span></div>
      <div class="adapt-row"><span>Power</span><span>${plan.powerBudget}</span></div>
    </div>
    <code class="adapt-code">${formatAdaptPlan(plan)}</code>
  `;
}

export function renderVerticalFocus(container, categoryId) {
  if (!container) return;
  const f = getVerticalFocus(categoryId);
  if (!f.surfaceMeta || !f.pillarMeta) return;

  container.innerHTML = `
    <div class="vd-focus-map">
      <span class="vd-focus-chip surface">${f.surfaceMeta.title}</span>
      <span class="vd-focus-chip pillar">${f.pillarMeta.label}</span>
    </div>
  `;
}
