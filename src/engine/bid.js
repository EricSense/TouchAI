import { LP_PROMISED_RATE, MAX_SHARE_RATE, MAX_TERM_WEEKS, MIN_SHARE_RATE } from './constants.js';
import { clamp, makeId, money, nowIso } from './ids.js';
import { log, requireActor, requireAllocator } from './audit.js';
import { findProblem } from './problem.js';

export function scoreBid(bid, problem, lpPromisedRate = LP_PROMISED_RATE) {
  const suggested = problem.sizing?.suggestedCapital;
  const shareTarget = problem.sizing?.suggestedShareRate ?? 0.18;
  if (!suggested) throw new Error('Cannot score a bid against an unsized problem');

  const capitalEfficiency = clamp(1 - (bid.capitalAsk - suggested) / suggested, 0, 1);
  const shareFloor = lpPromisedRate;
  const shareSpan = Math.max(shareTarget - shareFloor, 0.04);
  const shareScore = clamp((bid.shareRate - shareFloor) / shareSpan, 0, 1);
  const credibility = clamp(bid.bidder?.credibility ?? 0, 0, 1);
  const speed = clamp(1 - (bid.timelineWeeks - 3) / (MAX_TERM_WEEKS - 3), 0, 1);
  const plan = clamp(bid.planQuality ?? 0.5, 0, 1);

  const score = money(
    0.25 * capitalEfficiency + 0.25 * shareScore + 0.25 * credibility + 0.15 * speed + 0.1 * plan,
  );

  return {
    score,
    breakdown: {
      capitalEfficiency: money(capitalEfficiency),
      shareScore: money(shareScore),
      credibility: money(credibility),
      speed: money(speed),
      plan: money(plan),
    },
  };
}

export function bidValidity(bid, problem, pool) {
  const errors = [];
  if (!problem.sizing) errors.push('problem is not sized');
  if (problem.status !== 'posted') errors.push('problem is not open for bids');
  if (bid.shareRate < MIN_SHARE_RATE) {
    errors.push(`share rate must exceed LP promised rate (${MIN_SHARE_RATE})`);
  }
  if (bid.shareRate > MAX_SHARE_RATE) errors.push('share rate exceeds maximum');
  if (bid.capitalAsk <= 0) errors.push('capital ask must be positive');
  if (bid.timelineWeeks < 1 || bid.timelineWeeks > MAX_TERM_WEEKS) {
    errors.push(`term must be 1–${MAX_TERM_WEEKS} weeks`);
  }
  if (pool && bid.capitalAsk > pool.available) errors.push('capital ask exceeds dry powder');
  if (!bid.bidder?.name) errors.push('bidder must be named');
  if (!['solo', 'team', 'agent'].includes(bid.bidder?.type)) errors.push('unknown bidder type');
  return errors;
}

export function rankBids(bids, problem, lpPromisedRate) {
  return [...bids]
    .map((bid) => ({ bid, ...scoreBid(bid, problem, lpPromisedRate) }))
    .sort((a, b) => b.score - a.score || a.bid.capitalAsk - b.bid.capitalAsk);
}

export function submitBid(state, input, actor) {
  requireActor(actor, 'bid');
  const problem = findProblem(state, input.problemId);
  const bid = {
    id: makeId('bid'),
    problemId: problem.id,
    bidder: {
      name: input.bidder.name,
      type: input.bidder.type,
      credibility: clamp(Number(input.bidder.credibility) || 0.5, 0, 1),
    },
    capitalAsk: money(input.capitalAsk),
    shareRate: money(input.shareRate),
    timelineWeeks: Number(input.timelineWeeks),
    plan: input.plan || '',
    planQuality: clamp(Number(input.planQuality) || 0.55, 0, 1),
    status: 'open',
    createdAt: nowIso(),
  };

  const errors = bidValidity(bid, problem, state.pool);
  if (errors.length) throw new Error(`Invalid bid: ${errors.join('; ')}`);

  const scored = scoreBid(bid, problem, state.pool.lpPromisedRate);
  bid.score = scored.score;
  bid.breakdown = scored.breakdown;
  state.bids.push(bid);

  log(state, {
    actor,
    action: 'bid',
    entityType: 'bid',
    entityId: bid.id,
    rationale: `${bid.bidder.name} bid on ${problem.title}`,
    detail: { score: bid.score, capitalAsk: bid.capitalAsk, shareRate: bid.shareRate },
  });

  return bid;
}

export function awardBid(state, { problemId, bidId }, actor) {
  requireAllocator(actor, 'award');
  const problem = findProblem(state, problemId);
  if (problem.status !== 'posted') throw new Error('Only posted problems can be awarded');

  const bid = state.bids.find((b) => b.id === bidId && b.problemId === problemId);
  if (!bid) throw new Error('Bid not found on this problem');
  if (bid.status !== 'open') throw new Error('Bid is not open');

  const open = state.bids.filter((b) => b.problemId === problemId && b.status === 'open');
  const ranked = rankBids(open, problem, state.pool.lpPromisedRate);
  const best = ranked[0]?.bid;
  const rationaleExtra =
    best && best.id !== bid.id
      ? ` Allocator overrode the top-scored bid (${best.bidder.name}, ${best.score}).`
      : '';

  for (const b of open) b.status = b.id === bid.id ? 'won' : 'lost';
  problem.status = 'awarded';
  problem.winningBidId = bid.id;

  log(state, {
    actor,
    action: 'award',
    entityType: 'bid',
    entityId: bid.id,
    rationale: `Awarded execution rights to ${bid.bidder.name}.${rationaleExtra} Allocator is liable for this allocation.`,
    detail: { problemId, score: bid.score, overridden: Boolean(best && best.id !== bid.id) },
  });

  return { problem, bid };
}
