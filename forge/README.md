# FORGE

**The capital that builds its own startups.**

An AI-native fund that detects problems, instantiates disposable ventures to solve them, and gets repaid as a share of verified outcomes — no pitch decks, no cap tables, no company that outlives its use.

FORGE is a **separate product from TouchAI**. This directory is the whole app: engine, UI, tests, and Vercel config. Do not deploy it from the repository root (that project is TouchAI).

**Live:** https://forge-lilac-nu.vercel.app

## The mechanism

1. **Problem detection** — signals cluster into sized, evidenced problems. Decks are not an input.
2. **Disposable ventures** — the winning bid instantiates a contractor-only shell with a 12-week maximum term. It scales, plateaus, or dissolves.
3. **Outcome-linked capital** — repayment is a live share of verified outcomes (payments, usage, telemetry, escrow). FORGE’s carry is the spread between the venture’s share rate and the rate promised to LPs. When the stream ends, so does the obligation.

Phase 1 will not auto-allocate. Award, instantiate, and dissolve must be signed by a liable **allocator**.

## Run

```bash
cd forge
npm install
npm test
npm run dev
```

Open the Loop view and operate a seeded B2B ops pilot.

## Deploy (own Vercel project)

Production is a **new** Vercel project named `forge` (Root Directory = `forge`). It does not overwrite [TouchAI](https://touchai-kohl.vercel.app).

```bash
cd forge
npx vercel --yes --prod
```

## Engine

The loop is a pure module in `src/engine`. It enforces:

- share rates above the LP promised rate (no negative spread)
- 12-week legal term cap
- SHA-256 attestations over canonical outcome payloads
- pool identity: `available + allocated + write-downs + platform fees = committed + LP yield`
