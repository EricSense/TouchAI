/** Phase 1 of the FORGE roadmap: humans decide, the engine enforces. */

export const PHASE = 'manual-loop';
export const VERTICAL = 'b2b-ops';
export const VERTICAL_LABEL = 'B2B ops automation';

export const PLATFORM_FEE_RATE = 0.02;
export const MAX_TERM_WEEKS = 12;
export const LP_PROMISED_RATE = 0.12;
export const MIN_SHARE_RATE = LP_PROMISED_RATE + 0.01;
export const MAX_SHARE_RATE = 0.35;
export const DEFAULT_COMMITTED = 2_500_000;

export const OUTCOME_SOURCES = ['payments', 'usage', 'telemetry', 'escrow'];

export const PROBLEM_STATUSES = ['detected', 'sized', 'posted', 'awarded', 'archived'];
export const VENTURE_STATUSES = ['instantiating', 'live', 'plateau', 'dissolving', 'dissolved'];
export const BIDDER_TYPES = ['solo', 'team', 'agent'];

export const ALLOCATOR_ACTIONS = new Set(['award', 'instantiate', 'dissolve']);

export const LEGAL_SHELL = {
  kind: 'disposable-contractor-shell',
  labor: 'contractors-only',
  equity: false,
  securities: 'outcome-share-agreement',
  autoDissolve: true,
  termWeeksMax: MAX_TERM_WEEKS,
};
