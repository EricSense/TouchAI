/**
 * Situated routing — pick an assistant from live hardware situation + intent.
 */

/**
 * @param {object} hw
 * @param {object} plan - from adaptExecution
 * @param {string} [query]
 * @returns {{ id: string, name: string, confidence: number, reasons: string[], localOk: boolean, defer: boolean }}
 */
export function recommendAssistant(hw, plan, query = '') {
  const q = (query || '').toLowerCase();
  const a = hw?.awareness;
  const thermalHot = a?.thermal?.throttleRisk === 'elevated' || /throttl|hot|warm/.test(a?.thermal?.state ?? '');
  const lowPower = /critical|power-save|low/.test(a?.power?.budget ?? '') || /low|critical/.test(a?.power?.level ?? '');
  const lowRam = hw?.ramGb != null && hw.ramGb <= 4;
  const localOk = Boolean(plan && !plan.shouldDefer && plan.device !== 'cpu');
  const coding = /code|coding|dev|debug|refactor|typescript|python|git|pr\b|lint/.test(q);
  const heavy = /heavy|large|batch|train|fine-?tun|depth|long context|summarize (this|all)/.test(q);
  const localAsk = /local(ly)?|on-?device|offline|this machine|this host/.test(q);

  const reasons = [];
  let id = 'local';
  let confidence = 0.72;

  if (plan?.shouldDefer || plan?.device === 'cpu' || (heavy && (thermalHot || lowPower || lowRam))) {
    id = 'cloud';
    confidence = 0.86;
    if (plan?.shouldDefer) reasons.push('adapt plan deferred heavy local work');
    if (plan?.device === 'cpu') reasons.push('compute path is CPU-only');
    if (thermalHot) reasons.push(`thermal ${a.thermal.state}`);
    if (lowPower) reasons.push(`power ${a.power.budget}`);
    if (lowRam) reasons.push(`RAM ${hw.ram} — keep load off-device`);
    if (heavy) reasons.push('task looks heavy for this host right now');
  } else if (coding && !lowRam && (hw?.ramGb == null || hw.ramGb >= 8)) {
    id = 'code';
    confidence = 0.8;
    reasons.push('coding intent detected');
    reasons.push(`RAM ${hw.ram} supports a dedicated coding path`);
    if (localOk) reasons.push(`local path ${plan.device}/${plan.dtype} healthy`);
  } else {
    id = 'local';
    confidence = localOk ? 0.84 : 0.62;
    if (localAsk) reasons.push('you asked for local / this host');
    reasons.push(`probed path ${plan?.device}/${plan?.dtype}`);
    reasons.push(`thermal ${a?.thermal?.state ?? 'unknown'} · power ${a?.power?.level ?? 'unknown'}`);
    if (!localOk) reasons.push('local path constrained — still preferred over blind cloud');
  }

  const names = {
    local: 'Local model',
    cloud: 'Cloud assistant',
    code: 'Coding assistant',
  };

  return {
    id,
    name: names[id],
    confidence,
    reasons,
    localOk,
    defer: Boolean(plan?.shouldDefer),
    path: plan ? `${plan.device}/${plan.dtype}` : '—',
    tokens: plan?.maxTokens ?? null,
  };
}

export function formatRouteDecision(decision) {
  const pct = Math.round(decision.confidence * 100);
  return [
    `→ Prefer ${decision.name} (${pct}% confidence)`,
    `Path ${decision.path}${decision.tokens != null ? ` · ${decision.tokens} tok` : ''}`,
    ...decision.reasons.map((r) => `· ${r}`),
  ].join('\n');
}
