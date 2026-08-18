import { PLATFORM_FEE_RATE } from './constants.js';
import { money } from './ids.js';

export function platformFee(capitalAsk, rate = PLATFORM_FEE_RATE) {
  return money(capitalAsk * rate);
}

export function allocationCost(capitalAsk, rate = PLATFORM_FEE_RATE) {
  return money(capitalAsk + platformFee(capitalAsk, rate));
}

export function canAllocate(pool, capitalAsk, rate = PLATFORM_FEE_RATE) {
  return pool.available >= allocationCost(capitalAsk, rate);
}

export function applyInstantiation(pool, { capitalAsk, feeRate = PLATFORM_FEE_RATE }) {
  const fee = platformFee(capitalAsk, feeRate);
  const cost = money(capitalAsk + fee);
  if (pool.available < cost) {
    throw new Error('Insufficient dry powder for capital + platform fee');
  }
  pool.available = money(pool.available - cost);
  pool.allocated = money(pool.allocated + capitalAsk);
  pool.platformFees = money(pool.platformFees + fee);
  return { fee, cost };
}

/**
 * Outcome cash is external. LP portion hits the pool:
 * - restores outstanding allocated capital first
 * - remainder is LP yield (return above capital)
 * FORGE spread never re-enters the LP pool.
 */
export function settleOutcome(pool, venture, { grossValue, shareRate, lpPromisedRate }) {
  const forgeShare = money(grossValue * shareRate);
  const lpShare = money(grossValue * lpPromisedRate);
  const spread = money(forgeShare - lpShare);
  if (spread < 0) throw new Error('Negative spread — bid should never have been awarded');

  const restored = money(Math.min(lpShare, venture.outstanding));
  const yieldAmt = money(lpShare - restored);

  pool.available = money(pool.available + lpShare);
  pool.allocated = money(pool.allocated - restored);
  pool.returned = money(pool.returned + lpShare);
  pool.lpYield = money((pool.lpYield || 0) + yieldAmt);
  pool.spreadEarned = money(pool.spreadEarned + spread);

  venture.outstanding = money(venture.outstanding - restored);
  venture.recovered = money(venture.recovered + forgeShare);
  venture.lpReturned = money((venture.lpReturned || 0) + lpShare);
  venture.spreadPaid = money((venture.spreadPaid || 0) + spread);

  return { forgeShare, lpShare, spread, restored, yieldAmt };
}

export function applyDissolution(pool, venture) {
  const writeDown = money(Math.max(0, venture.outstanding));
  pool.allocated = money(pool.allocated - writeDown);
  pool.writeDowns = money(pool.writeDowns + writeDown);
  venture.outstanding = 0;
  return { writeDown };
}

export function poolIdentity(pool) {
  const uses = money(pool.available + pool.allocated + pool.writeDowns + pool.platformFees);
  const sources = money(pool.committed + (pool.lpYield || 0));
  return {
    uses,
    sources,
    committed: pool.committed,
    lpYield: pool.lpYield || 0,
    balanced: uses === sources,
    drift: money(uses - sources),
  };
}

export function poolSnapshot(state) {
  const live = state.ventures.filter((v) => v.status === 'live' || v.status === 'plateau');
  return {
    ...state.pool,
    liveVentures: live.length,
    identity: poolIdentity(state.pool),
  };
}
