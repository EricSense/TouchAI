import {
  DEFAULT_COMMITTED,
  LP_PROMISED_RATE,
  PHASE,
  PLATFORM_FEE_RATE,
  VERTICAL,
} from './constants.js';
import { ingestSignal, postProblem, sizeProblem } from './problem.js';
import { awardBid, rankBids, submitBid } from './bid.js';
import {
  dissolveVenture,
  instantiateVenture,
  recordOutcome,
} from './venture.js';
import { poolSnapshot } from './capital.js';

export {
  DEFAULT_COMMITTED,
  LP_PROMISED_RATE,
  PHASE,
  PLATFORM_FEE_RATE,
  VERTICAL,
} from './constants.js';
export { LEGAL_SHELL, MAX_TERM_WEEKS, MIN_SHARE_RATE, OUTCOME_SOURCES } from './constants.js';
export { evidenceScore, sizeAndPrice } from './problem.js';
export { rankBids, scoreBid } from './bid.js';
export { poolIdentity, poolSnapshot, canAllocate, platformFee } from './capital.js';
export { priceVenture } from './venture.js';
export { attestOutcome, verifyAttestation } from './verify.js';
export { digestPayload } from './hash.js';
export {
  ingestSignal,
  sizeProblem,
  postProblem,
  submitBid,
  awardBid,
  instantiateVenture,
  recordOutcome,
  dissolveVenture,
};

export function emptyState({ committed = DEFAULT_COMMITTED } = {}) {
  return {
    meta: {
      phase: PHASE,
      vertical: VERTICAL,
      name: 'FORGE Pilot',
    },
    pool: {
      committed,
      available: committed,
      allocated: 0,
      returned: 0,
      lpYield: 0,
      spreadEarned: 0,
      platformFees: 0,
      writeDowns: 0,
      lpPromisedRate: LP_PROMISED_RATE,
      platformFeeRate: PLATFORM_FEE_RATE,
    },
    problems: [],
    bids: [],
    ventures: [],
    outcomes: [],
    audit: [],
  };
}

export function nextActions(state) {
  const actions = [];

  for (const problem of state.problems) {
    if (problem.status === 'detected') {
      actions.push({
        kind: 'size',
        entityId: problem.id,
        title: problem.title,
        label: 'Size and price this evidenced problem',
      });
    }
    if (problem.status === 'sized') {
      actions.push({
        kind: 'post',
        entityId: problem.id,
        title: problem.title,
        label: 'Post to the market — no deck required',
      });
    }
    if (problem.status === 'posted') {
      const open = state.bids.filter((b) => b.problemId === problem.id && b.status === 'open');
      if (open.length) {
        const ranked = rankBids(open, problem, state.pool.lpPromisedRate);
        actions.push({
          kind: 'award',
          entityId: problem.id,
          title: problem.title,
          label: `Award execution rights (${open.length} bid${open.length === 1 ? '' : 's'})`,
          topBidId: ranked[0]?.bid.id,
        });
      }
    }
    if (problem.status === 'awarded') {
      const live = state.ventures.some(
        (v) => v.problemId === problem.id && v.status !== 'dissolved',
      );
      if (!live) {
        actions.push({
          kind: 'instantiate',
          entityId: problem.id,
          title: problem.title,
          label: 'Instantiate the disposable venture',
        });
      }
    }
  }

  const now = Date.now();
  for (const venture of state.ventures) {
    if (venture.status === 'dissolved') continue;
    const overdue = Date.parse(venture.shell.dissolvesAt) <= now;
    if (venture.status === 'plateau' || overdue) {
      actions.push({
        kind: 'dissolve',
        entityId: venture.id,
        title: venture.name,
        label: overdue
          ? 'Term elapsed — dissolve the shell'
          : 'Outcome stream plateaued — dissolve or keep live',
      });
    }
  }

  return actions;
}

export function createForge(initial = emptyState()) {
  let state = initial;

  return {
    getState: () => state,
    setState: (next) => {
      state = next;
      return state;
    },
    snapshot: () => structuredClone(state),
    ingestSignal: (input, actor) => ingestSignal(state, input, actor),
    sizeProblem: (id, sizing, actor) => sizeProblem(state, id, sizing, actor),
    postProblem: (id, actor) => postProblem(state, id, actor),
    submitBid: (input, actor) => submitBid(state, input, actor),
    awardBid: (input, actor) => awardBid(state, input, actor),
    instantiateVenture: (input, actor, at) => instantiateVenture(state, input, actor, at),
    recordOutcome: (input, actor, at) => recordOutcome(state, input, actor, at),
    dissolveVenture: (input, actor, at) => dissolveVenture(state, input, actor, at),
    nextActions: () => nextActions(state),
    pool: () => poolSnapshot(state),
  };
}
