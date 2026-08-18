import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  awardBid,
  createForge,
  dissolveVenture,
  emptyState,
  evidenceScore,
  instantiateVenture,
  nextActions,
  poolIdentity,
  postProblem,
  rankBids,
  recordOutcome,
  scoreBid,
  sizeAndPrice,
  sizeProblem,
  submitBid,
  verifyAttestation,
} from '../src/engine/index.js';
import { ingestSignal } from '../src/engine/problem.js';
import { attestOutcome } from '../src/engine/verify.js';
import { buildSeed } from '../src/data/seed.js';

const OP = { id: 'op', name: 'Ada Okonkwo', role: 'operator' };
const ALLOC = { id: 'al', name: 'M. Calder', role: 'allocator' };

function sizedProblem(state) {
  const { problem } = ingestSignal(
    state,
    {
      source: 'payments',
      cluster: 'test-cluster',
      title: 'Test problem',
      summary: 'A verified ops bottleneck',
      weight: 0.8,
    },
    OP,
  );
  ingestSignal(
    state,
    { source: 'telemetry', cluster: 'test-cluster', excerpt: 'repeat pattern', weight: 0.5 },
    OP,
  );
  sizeProblem(state, problem.id, { frequencyPerMonth: 100, severityUsd: 250 }, OP);
  return problem;
}

describe('sizing and evidence', () => {
  it('scores evidence from signals and sources', () => {
    const score = evidenceScore([
      { source: 'payments', weight: 0.8 },
      { source: 'complaints', weight: 0.4 },
    ]);
    assert.ok(score > 40 && score <= 100);
  });

  it('prices capital as a fraction of evidenced annual pain', () => {
    const sized = sizeAndPrice({ frequencyPerMonth: 100, severityUsd: 200, evidence: 80 });
    assert.equal(sized.monthly, 20000);
    assert.equal(sized.addressableAnnual, 240000);
    assert.ok(sized.suggestedCapital >= 25000);
    assert.ok(sized.suggestedShareRate > 0.12);
  });
});

describe('the FORGE loop', () => {
  it('refuses to allocate capital without a liable allocator', () => {
    const state = emptyState();
    const problem = sizedProblem(state);
    postProblem(state, problem.id, OP);
    const bid = submitBid(
      state,
      {
        problemId: problem.id,
        bidder: { name: 'Mira', type: 'solo', credibility: 0.8 },
        capitalAsk: 50000,
        shareRate: 0.18,
        timelineWeeks: 6,
        plan: 'Ship the matcher',
        planQuality: 0.7,
      },
      OP,
    );
    assert.throws(() => awardBid(state, { problemId: problem.id, bidId: bid.id }, OP), /allocator/);
    assert.throws(
      () => instantiateVenture(state, { problemId: problem.id }, OP),
      /allocator/,
    );
  });

  it('runs detect → size → post → bid → award → instantiate → outcome → dissolve', async () => {
    const state = emptyState({ committed: 500_000 });
    const problem = sizedProblem(state);
    postProblem(state, problem.id, OP);

    const weak = submitBid(
      state,
      {
        problemId: problem.id,
        bidder: { name: 'Soft Bid', type: 'agent', credibility: 0.4 },
        capitalAsk: 90000,
        shareRate: 0.14,
        timelineWeeks: 11,
        plan: 'Maybe',
        planQuality: 0.3,
      },
      OP,
    );
    const strong = submitBid(
      state,
      {
        problemId: problem.id,
        bidder: { name: 'LedgerClose', type: 'team', credibility: 0.9 },
        capitalAsk: 60000,
        shareRate: 0.2,
        timelineWeeks: 5,
        plan: 'Payments file matcher',
        planQuality: 0.9,
      },
      OP,
    );

    const ranked = rankBids(
      [weak, strong],
      problem,
      state.pool.lpPromisedRate,
    );
    assert.equal(ranked[0].bid.id, strong.id);

    awardBid(state, { problemId: problem.id, bidId: strong.id }, ALLOC);
    const venture = instantiateVenture(state, { problemId: problem.id }, ALLOC);
    assert.equal(venture.status, 'live');
    assert.equal(venture.shell.equity, false);
    assert.ok(poolIdentity(state.pool).balanced);

    const outcome = await recordOutcome(
      state,
      {
        ventureId: venture.id,
        type: 'duplicate_payment_recovered',
        quantity: 1,
        unitValue: 20000,
        source: 'payments',
      },
      OP,
    );
    assert.equal(outcome.verified, true);
    assert.equal(outcome.forgeShare, 4000);
    assert.equal(outcome.lpShare, 2400);
    assert.equal(outcome.spread, 1600);
    assert.ok(poolIdentity(state.pool).balanced);

    const { writeDown } = dissolveVenture(
      state,
      { ventureId: venture.id, reason: 'Stream ended' },
      ALLOC,
    );
    assert.equal(venture.status, 'dissolved');
    assert.ok(writeDown > 0);
    assert.ok(poolIdentity(state.pool).balanced);

    await assert.rejects(
      () =>
        recordOutcome(
          state,
          {
            ventureId: venture.id,
            type: 'duplicate_payment_recovered',
            quantity: 1,
            unitValue: 1000,
            source: 'payments',
          },
          OP,
        ),
      /stream ends/,
    );
  });

  it('rejects bids that cannot clear the LP promised rate', () => {
    const state = emptyState();
    const problem = sizedProblem(state);
    postProblem(state, problem.id, OP);
    assert.throws(
      () =>
        submitBid(
          state,
          {
            problemId: problem.id,
            bidder: { name: 'Low', type: 'solo', credibility: 0.9 },
            capitalAsk: 40000,
            shareRate: 0.1,
            timelineWeeks: 4,
            plan: 'Too thin',
          },
          OP,
        ),
      /share rate/,
    );
  });
});

describe('verification', () => {
  it('detects a tampered attestation', async () => {
    const attested = await attestOutcome({
      ventureId: 'vnt_test',
      type: 'hours_saved',
      quantity: 10,
      unitValue: 100,
      source: 'telemetry',
      occurredAt: '2026-08-01T00:00:00.000Z',
      nonce: 'nce_fixed',
    });
    const ok = await verifyAttestation(attested);
    assert.equal(ok.ok, true);

    attested.payload.quantity = 999;
    const bad = await verifyAttestation(attested);
    assert.equal(bad.ok, false);
  });

  it('rejects unverifiable sources', async () => {
    await assert.rejects(
      () =>
        attestOutcome({
          ventureId: 'vnt_test',
          type: 'hours_saved',
          quantity: 1,
          unitValue: 1,
          source: 'spreadsheet',
          occurredAt: '2026-08-01T00:00:00.000Z',
        }),
      /live-verifiable/,
    );
  });
});

describe('seeded pilot', () => {
  it('loads a balanced B2B ops world with a live venture', async () => {
    const state = await buildSeed();
    assert.ok(poolIdentity(state.pool).balanced);
    assert.ok(state.problems.length >= 5);
    assert.equal(state.ventures.filter((v) => v.status === 'live').length, 1);
    assert.ok(state.outcomes.every((o) => o.verified && o.hash));
    const actions = nextActions(state);
    assert.ok(actions.some((a) => a.kind === 'award'));
    assert.ok(actions.some((a) => a.kind === 'size' || a.kind === 'post'));
  });
});

describe('scoreBid', () => {
  it('rewards cheaper, higher-share, more credible bids', () => {
    const problem = {
      sizing: { suggestedCapital: 100000, suggestedShareRate: 0.18 },
    };
    const a = scoreBid(
      {
        capitalAsk: 80000,
        shareRate: 0.2,
        timelineWeeks: 4,
        planQuality: 0.8,
        bidder: { credibility: 0.9 },
      },
      problem,
      0.12,
    );
    const b = scoreBid(
      {
        capitalAsk: 180000,
        shareRate: 0.14,
        timelineWeeks: 12,
        planQuality: 0.4,
        bidder: { credibility: 0.4 },
      },
      problem,
      0.12,
    );
    assert.ok(a.score > b.score);
  });
});
