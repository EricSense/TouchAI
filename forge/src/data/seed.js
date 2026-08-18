import { createForge, emptyState } from '../engine/index.js';

export const SCANNER = { id: 'act_scan', name: 'FORGE Scanner', role: 'operator' };
export const OPERATOR = { id: 'act_ops', name: 'Ada Okonkwo', role: 'operator' };
export const ALLOCATOR = { id: 'act_alloc', name: 'M. Calder', role: 'allocator' };

const day = 24 * 60 * 60 * 1000;

export async function buildSeed(now = Date.now()) {
  const forge = createForge(emptyState({ committed: 2_500_000 }));
  const t = (daysAgo) => now - daysAgo * day;

  const invoice = forge.ingestSignal(
    {
      source: 'payments',
      cluster: 'invoice-to-cash matching',
      title: 'Mid-market invoice-to-cash matching lag',
      summary:
        'Manufacturers with 200–800 invoices/month are trapping AR in 9–14 day match cycles. ERP mismatch, not credit risk.',
      weight: 0.82,
      at: new Date(t(18)).toISOString(),
    },
    SCANNER,
  ).problem;
  forge.ingestSignal(
    {
      source: 'ops-telemetry',
      cluster: 'invoice-to-cash matching',
      excerpt: 'Median 11.4 days invoice-to-cash vs 4-day peer benchmark',
      weight: 0.7,
      at: new Date(t(12)).toISOString(),
    },
    SCANNER,
  );
  forge.ingestSignal(
    {
      source: 'complaints',
      cluster: 'invoice-to-cash matching',
      excerpt: 'CFO forum: “we have a person who only matches POs to invoices”',
      weight: 0.55,
      at: new Date(t(9)).toISOString(),
    },
    SCANNER,
  );
  forge.sizeProblem(invoice.id, { frequencyPerMonth: 420, severityUsd: 380 }, OPERATOR);
  forge.postProblem(invoice.id, OPERATOR);

  forge.submitBid(
    {
      problemId: invoice.id,
      bidder: { name: 'Mira Chen', type: 'solo', credibility: 0.84 },
      capitalAsk: 95_000,
      shareRate: 0.18,
      timelineWeeks: 6,
      plan: 'Match-agent on ERP exports + exception desk. Human on $10k+ mismatches.',
      planQuality: 0.8,
    },
    OPERATOR,
  );
  forge.submitBid(
    {
      problemId: invoice.id,
      bidder: { name: 'Ribbon Ops', type: 'team', credibility: 0.76 },
      capitalAsk: 140_000,
      shareRate: 0.2,
      timelineWeeks: 8,
      plan: 'Three-person team, existing AP playbook, 90-day contractor stack.',
      planQuality: 0.72,
    },
    OPERATOR,
  );
  forge.submitBid(
    {
      problemId: invoice.id,
      bidder: { name: 'Kestrel Agent', type: 'agent', credibility: 0.58 },
      capitalAsk: 62_000,
      shareRate: 0.16,
      timelineWeeks: 4,
      plan: 'Fully agentic matcher; human allocator reviews weekly exception sample.',
      planQuality: 0.64,
    },
    OPERATOR,
  );

  const support = forge.ingestSignal(
    {
      source: 'ops-telemetry',
      cluster: 'l1 support backlog',
      title: 'Vertical SaaS L1 support SLA collapse',
      summary:
        'Ticket volume up 3.1× after a usage-based pricing change. 38% of L1 misses first-response SLA; churn tags cite “support.”',
      weight: 0.78,
      at: new Date(t(14)).toISOString(),
    },
    SCANNER,
  ).problem;
  forge.ingestSignal(
    {
      source: 'complaints',
      cluster: 'l1 support backlog',
      excerpt: 'G2: “we wait two days for password and seat issues”',
      weight: 0.6,
      at: new Date(t(8)).toISOString(),
    },
    SCANNER,
  );
  forge.sizeProblem(support.id, { frequencyPerMonth: 2100, severityUsd: 46 }, OPERATOR);
  forge.postProblem(support.id, OPERATOR);
  forge.submitBid(
    {
      problemId: support.id,
      bidder: { name: 'Northline Studio', type: 'team', credibility: 0.88 },
      capitalAsk: 110_000,
      shareRate: 0.19,
      timelineWeeks: 7,
      plan: 'Deflection agent + 2 contractors on escalations. Outcome = tickets resolved in SLA.',
      planQuality: 0.86,
    },
    OPERATOR,
  );
  forge.submitBid(
    {
      problemId: support.id,
      bidder: { name: 'Ife Adebayo', type: 'solo', credibility: 0.71 },
      capitalAsk: 72_000,
      shareRate: 0.17,
      timelineWeeks: 5,
      plan: 'Macros + retrieval bot trained on the last 18 months of tickets.',
      planQuality: 0.7,
    },
    OPERATOR,
  );

  const po = forge.ingestSignal(
    {
      source: 'ops-telemetry',
      cluster: 'po-receipt mismatch',
      title: 'PO-to-receipt mismatch driving stockouts',
      summary:
        'Receiving docks close tickets against the wrong PO line. Inventory shows in-stock while the floor is empty.',
      weight: 0.66,
      at: new Date(t(6)).toISOString(),
    },
    SCANNER,
  ).problem;
  forge.ingestSignal(
    {
      source: 'pricing',
      cluster: 'po-receipt mismatch',
      excerpt: 'Expedite freight spend +18% QoQ on items that were already ordered',
      weight: 0.5,
      at: new Date(t(4)).toISOString(),
    },
    SCANNER,
  );

  const onboard = forge.ingestSignal(
    {
      source: 'usage',
      cluster: 'onboarding time-to-value',
      title: 'B2B onboarding time-to-value stuck at 19 days',
      summary:
        'Implementation checklists live in email. Time-to-first-value correlates 0.61 with 90-day retention and is not staffed as a product.',
      weight: 0.74,
      at: new Date(t(11)).toISOString(),
    },
    SCANNER,
  ).problem;
  forge.ingestSignal(
    {
      source: 'complaints',
      cluster: 'onboarding time-to-value',
      excerpt: 'CSM notes: “customers go dark between kickoff and data mapping”',
      weight: 0.48,
      at: new Date(t(7)).toISOString(),
    },
    SCANNER,
  );
  forge.sizeProblem(onboard.id, { frequencyPerMonth: 36, severityUsd: 4200 }, OPERATOR);

  forge.ingestSignal(
    {
      source: 'payments',
      cluster: 'freight invoice leakage',
      title: 'Freight invoice audit leakage',
      summary:
        'Accessorials and duplicate invoices pass because AP samples 4% of bills. Clean, payable outcome data exists in the TMS.',
      weight: 0.44,
      at: new Date(t(3)).toISOString(),
    },
    SCANNER,
  );

  const vendor = forge.ingestSignal(
    {
      source: 'payments',
      cluster: 'duplicate vendor payments',
      title: 'Duplicate vendor payments in multi-entity AP',
      summary:
        'Same vendor, two entities, two vendor masters. Recoverable duplicates of $2–18k, evidenced in the payment file.',
      weight: 0.8,
      at: new Date(t(28)).toISOString(),
    },
    SCANNER,
  ).problem;
  forge.ingestSignal(
    {
      source: 'ops-telemetry',
      cluster: 'duplicate vendor payments',
      excerpt: 'Match rate on TIN + normalized name is 11% today',
      weight: 0.62,
      at: new Date(t(24)).toISOString(),
    },
    SCANNER,
  );
  forge.sizeProblem(vendor.id, { frequencyPerMonth: 14, severityUsd: 8600 }, OPERATOR);
  forge.postProblem(vendor.id, OPERATOR);
  const won = forge.submitBid(
    {
      problemId: vendor.id,
      bidder: { name: 'LedgerClose', type: 'team', credibility: 0.9 },
      capitalAsk: 80_000,
      shareRate: 0.22,
      timelineWeeks: 10,
      plan: 'Payment-file matcher with treasury confirmation. Outcome = recovered duplicate $.',
      planQuality: 0.9,
    },
    OPERATOR,
  );
  forge.submitBid(
    {
      problemId: vendor.id,
      bidder: { name: 'Solo AP lane', type: 'solo', credibility: 0.6 },
      capitalAsk: 48_000,
      shareRate: 0.15,
      timelineWeeks: 9,
      plan: 'Spreadsheet plus weekly treasury call.',
      planQuality: 0.4,
    },
    OPERATOR,
  );
  forge.awardBid({ problemId: vendor.id, bidId: won.id }, ALLOCATOR);
  const venture = forge.instantiateVenture({ problemId: vendor.id }, ALLOCATOR, t(21));

  await forge.recordOutcome(
    {
      ventureId: venture.id,
      type: 'duplicate_payment_recovered',
      quantity: 1,
      unitValue: 12400,
      source: 'payments',
      occurredAt: new Date(t(14)).toISOString(),
    },
    OPERATOR,
    t(14),
  );
  await forge.recordOutcome(
    {
      ventureId: venture.id,
      type: 'duplicate_payment_recovered',
      quantity: 2,
      unitValue: 6100,
      source: 'payments',
      occurredAt: new Date(t(8)).toISOString(),
    },
    OPERATOR,
    t(8),
  );
  await forge.recordOutcome(
    {
      ventureId: venture.id,
      type: 'duplicate_payment_recovered',
      quantity: 1,
      unitValue: 17850,
      source: 'escrow',
      occurredAt: new Date(t(2)).toISOString(),
    },
    OPERATOR,
    t(2),
  );

  return forge.getState();
}

export function actors() {
  return { SCANNER, OPERATOR, ALLOCATOR };
}
