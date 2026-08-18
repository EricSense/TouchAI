import {
  LP_PROMISED_RATE,
  MAX_SHARE_RATE,
  MIN_SHARE_RATE,
} from './constants.js';
import { clamp, makeId, money, nowIso } from './ids.js';
import { log, requireActor } from './audit.js';

export function evidenceScore(signals = []) {
  if (!signals.length) return 0;
  const weightSum = signals.reduce((s, x) => s + (Number(x.weight) || 0), 0);
  const sources = new Set(signals.map((s) => s.source)).size;
  return Math.round(clamp(weightSum * 22 + sources * 12 + signals.length * 4, 0, 100));
}

export function impliedRisk(evidence) {
  return clamp(1 - evidence / 100, 0.08, 0.85);
}

export function sizeAndPrice({ frequencyPerMonth, severityUsd, evidence = 0 }) {
  const freq = Number(frequencyPerMonth);
  const sev = Number(severityUsd);
  if (!Number.isFinite(freq) || freq <= 0) throw new Error('frequencyPerMonth must be > 0');
  if (!Number.isFinite(sev) || sev <= 0) throw new Error('severityUsd must be > 0');

  const monthly = money(freq * sev);
  const addressableAnnual = money(monthly * 12);
  const confidence = clamp(evidence / 100, 0.05, 1);
  const risk = impliedRisk(evidence);
  const suggestedCapital = money(clamp(addressableAnnual * 0.12 * confidence, 25_000, 400_000));
  const suggestedShareRate = money(
    clamp(LP_PROMISED_RATE + 0.04 + risk * 0.1, MIN_SHARE_RATE, MAX_SHARE_RATE),
  );

  return {
    frequencyPerMonth: freq,
    severityUsd: money(sev),
    monthly,
    addressableAnnual,
    evidence,
    confidence: money(confidence),
    risk: money(risk),
    suggestedCapital,
    suggestedShareRate,
  };
}

export function findProblem(state, problemId) {
  const problem = state.problems.find((p) => p.id === problemId);
  if (!problem) throw new Error(`Unknown problem ${problemId}`);
  return problem;
}

export function ingestSignal(state, input, actor) {
  requireActor(actor, 'ingest-signal');
  const signal = {
    id: makeId('sig'),
    source: input.source,
    cluster: input.cluster,
    excerpt: input.excerpt,
    weight: clamp(Number(input.weight) || 0.4, 0.05, 1),
    at: input.at ?? nowIso(),
  };

  let problem = state.problems.find(
    (p) => p.cluster === signal.cluster && !['awarded', 'archived'].includes(p.status),
  );

  if (!problem) {
    problem = {
      id: makeId('pbl'),
      cluster: signal.cluster,
      title: input.title || signal.cluster,
      vertical: state.meta.vertical,
      status: 'detected',
      summary: input.summary || '',
      signals: [],
      evidence: 0,
      sizing: null,
      winningBidId: null,
      createdAt: nowIso(),
    };
    state.problems.unshift(problem);
  }

  problem.signals.push(signal);
  problem.evidence = evidenceScore(problem.signals);
  if (input.summary) problem.summary = input.summary;
  if (input.title) problem.title = input.title;

  log(state, {
    actor,
    action: 'ingest-signal',
    entityType: 'problem',
    entityId: problem.id,
    rationale: `Signal from ${signal.source} clustered as ${signal.cluster}`,
    detail: { signalId: signal.id, evidence: problem.evidence },
  });

  return { problem, signal };
}

export function sizeProblem(state, problemId, { frequencyPerMonth, severityUsd }, actor) {
  requireActor(actor, 'size');
  const problem = findProblem(state, problemId);
  if (problem.status === 'awarded' || problem.status === 'archived') {
    throw new Error('Cannot resize an awarded or archived problem');
  }
  problem.evidence = evidenceScore(problem.signals);
  problem.sizing = sizeAndPrice({
    frequencyPerMonth,
    severityUsd,
    evidence: problem.evidence,
  });
  problem.status = 'sized';

  log(state, {
    actor,
    action: 'size',
    entityType: 'problem',
    entityId: problem.id,
    rationale: 'Sized from evidenced frequency × severity',
    detail: problem.sizing,
  });

  return problem;
}

export function postProblem(state, problemId, actor) {
  requireActor(actor, 'post');
  const problem = findProblem(state, problemId);
  if (problem.status !== 'sized' || !problem.sizing) {
    throw new Error('Problem must be sized before it can be posted');
  }
  problem.status = 'posted';
  log(state, {
    actor,
    action: 'post',
    entityType: 'problem',
    entityId: problem.id,
    rationale: 'Opened for bidding — no pitch required',
  });
  return problem;
}
