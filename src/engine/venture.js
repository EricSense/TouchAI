import { LEGAL_SHELL, MAX_TERM_WEEKS } from './constants.js';
import { makeId, money, msToWeeks, nowIso, weeksToMs } from './ids.js';
import { log, requireActor, requireAllocator } from './audit.js';
import {
  applyDissolution,
  applyInstantiation,
  canAllocate,
  settleOutcome,
} from './capital.js';
import { findProblem } from './problem.js';
import { attestOutcome, verifyAttestation } from './verify.js';

export function findVenture(state, ventureId) {
  const venture = state.ventures.find((v) => v.id === ventureId);
  if (!venture) throw new Error(`Unknown venture ${ventureId}`);
  return venture;
}

export function instantiateVenture(state, { problemId }, actor, at = Date.now()) {
  requireAllocator(actor, 'instantiate');
  const problem = findProblem(state, problemId);
  if (problem.status !== 'awarded' || !problem.winningBidId) {
    throw new Error('Instantiate requires an awarded bid');
  }
  if (state.ventures.some((v) => v.problemId === problemId && v.status !== 'dissolved')) {
    throw new Error('A live venture already exists for this problem');
  }

  const bid = state.bids.find((b) => b.id === problem.winningBidId);
  if (!bid || bid.status !== 'won') throw new Error('Winning bid is missing');
  if (bid.timelineWeeks > MAX_TERM_WEEKS) {
    throw new Error(`Phase 1 shells cannot exceed ${MAX_TERM_WEEKS} weeks`);
  }
  if (!canAllocate(state.pool, bid.capitalAsk, state.pool.platformFeeRate)) {
    throw new Error('Insufficient dry powder for capital + platform fee');
  }

  const formedAt = nowIso(at);
  const { fee } = applyInstantiation(state.pool, {
    capitalAsk: bid.capitalAsk,
    feeRate: state.pool.platformFeeRate,
  });

  const slug = problem.cluster
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join('');

  const venture = {
    id: makeId('vnt'),
    name: `Forge · ${slug || 'Shell'}`,
    problemId: problem.id,
    bidId: bid.id,
    status: 'live',
    shareRate: bid.shareRate,
    capitalAllocated: bid.capitalAsk,
    outstanding: bid.capitalAsk,
    recovered: 0,
    lpReturned: 0,
    spreadPaid: 0,
    platformFee: fee,
    termWeeks: bid.timelineWeeks,
    shell: {
      ...LEGAL_SHELL,
      formedAt,
      dissolvesAt: nowIso(at + weeksToMs(bid.timelineWeeks)),
    },
    team: {
      lead: bid.bidder.name,
      kind: bid.bidder.type,
      credibility: bid.bidder.credibility,
    },
    instantiatedAt: formedAt,
    dissolvedAt: null,
  };

  state.ventures.unshift(venture);

  log(state, {
    actor,
    action: 'instantiate',
    entityType: 'venture',
    entityId: venture.id,
    rationale: `Disposable shell ${venture.name} instantiated. No equity, no board. Allocator is liable.`,
    detail: {
      capitalAllocated: venture.capitalAllocated,
      shareRate: venture.shareRate,
      fee,
      dissolvesAt: venture.shell.dissolvesAt,
    },
  });

  return venture;
}

export function priceVenture(venture, outcomes, at = Date.now()) {
  const stream = outcomes.filter((o) => o.ventureId === venture.id && o.verified);
  const weeksAlive = Math.max(msToWeeks(at - Date.parse(venture.instantiatedAt)), 1 / 7);
  const recovered = stream.reduce((s, o) => s + o.forgeShare, 0);
  const weekly = recovered / weeksAlive;
  const remainingMs = Date.parse(venture.shell.dissolvesAt) - at;
  const remainingWeeks = Math.max(msToWeeks(remainingMs), 0);
  const projected = money(weekly * remainingWeeks * 0.5);
  const coverage = venture.capitalAllocated === 0 ? 1 : money(recovered / venture.capitalAllocated);
  return {
    weekly: money(weekly),
    remainingWeeks: money(remainingWeeks),
    projected,
    mark: money(recovered + projected),
    coverage,
    outcomeCount: stream.length,
  };
}

export async function recordOutcome(state, input, actor, at = Date.now()) {
  requireActor(actor, 'record-outcome');
  const venture = findVenture(state, input.ventureId);
  if (venture.status !== 'live' && venture.status !== 'plateau') {
    throw new Error('Outcomes are not accepted after the stream ends');
  }

  const occurredAt = input.occurredAt ?? nowIso(at);
  const attested = await attestOutcome({
    ventureId: venture.id,
    type: input.type,
    quantity: input.quantity,
    unitValue: input.unitValue,
    source: input.source,
    occurredAt,
    nonce: input.nonce,
  });

  const check = await verifyAttestation(attested);
  if (!check.ok) throw new Error('Attestation failed verification');

  const grossValue = money(Number(input.quantity) * Number(input.unitValue));
  const settlement = settleOutcome(state.pool, venture, {
    grossValue,
    shareRate: venture.shareRate,
    lpPromisedRate: state.pool.lpPromisedRate,
  });

  if (venture.outstanding === 0 && venture.status === 'live') venture.status = 'plateau';

  const outcome = {
    id: makeId('out'),
    ventureId: venture.id,
    type: input.type,
    quantity: Number(input.quantity),
    unitValue: money(input.unitValue),
    grossValue,
    source: input.source,
    occurredAt,
    recordedAt: nowIso(at),
    verified: true,
    hash: attested.hash,
    nonce: attested.nonce,
    ...settlement,
  };
  state.outcomes.unshift(outcome);

  log(state, {
    actor,
    action: 'record-outcome',
    entityType: 'outcome',
    entityId: outcome.id,
    rationale: `Verified ${input.type} via ${input.source}`,
    detail: { hash: outcome.hash, grossValue, ...settlement },
  });

  return outcome;
}

export function dissolveVenture(state, { ventureId, reason }, actor, at = Date.now()) {
  requireAllocator(actor, 'dissolve');
  const venture = findVenture(state, ventureId);
  if (venture.status === 'dissolved') throw new Error('Venture already dissolved');

  const { writeDown } = applyDissolution(state.pool, venture);
  venture.status = 'dissolved';
  venture.dissolvedAt = nowIso(at);

  log(state, {
    actor,
    action: 'dissolve',
    entityType: 'venture',
    entityId: venture.id,
    rationale: reason || 'Outcome stream ended; obligation ends with it.',
    detail: { writeDown, recovered: venture.recovered, capitalAllocated: venture.capitalAllocated },
  });

  return { venture, writeDown };
}
