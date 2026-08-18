# FORGE

**The capital that builds its own startups.**

An AI-native fund that detects problems, instantiates disposable ventures to solve them, and gets repaid as a share of verified outcomes — no pitch decks, no cap tables, no company that outlives its use.

This repository is the Phase 1 **manual loop**: one vertical (B2B ops automation), AI-assisted detection and pricing, humans on every capital decision.

## The mechanism

1. **Problem detection** — signals cluster into sized, evidenced problems. Decks are not an input.
2. **Disposable ventures** — the winning bid instantiates a contractor-only shell with a 12-week maximum term. It scales, plateaus, or dissolves.
3. **Outcome-linked capital** — repayment is a live share of verified outcomes (payments, usage, telemetry, escrow). FORGE’s carry is the spread between the venture’s share rate and the rate promised to LPs. When the stream ends, so does the obligation.

Phase 1 will not auto-allocate. Award, instantiate, and dissolve must be signed by a liable **allocator**.

## Run

```bash
npm install
npm test
npm run dev
```

Open the Loop view and operate a seeded pilot: invoice-to-cash, support SLA, duplicate vendor payments (already live with attested outcomes), and more.

## Engine

The loop is a pure module in `src/engine`. It enforces:

- share rates above the LP promised rate (no negative spread)
- 12-week legal term cap
- SHA-256 attestations over canonical outcome payloads
- pool identity: `available + allocated + write-downs + platform fees = committed + LP yield`

## What’s next

- **Phase 2** — automate detection and bid-matching; keep allocation and legal human-reviewed.
- **Phase 3** — selective autonomy on lower-risk decisions, using Phase 1–2 liability data.
