# TouchAI

**Hardware-aware AI.** Situational intelligence — not smarter models.

TouchAI gives every AI model deep knowledge of the hardware it runs on.

## The problem

Every AI company positions around capability. Smarter models. Faster responses. More parameters. Better benchmarks.

That race has one destination — commodity. When every model is smart enough, smart enough stops being a differentiator.

TouchAI doesn't play that game.

TouchAI positions around a different axis entirely: **situational intelligence**.

Not how smart is the AI — but how well does the AI understand where it is.

## The market

As foundation models commoditize, the value shifts to the layer around them — deployment. TouchAI is positioned exactly at that inflection point.

## Product roadmap

### TouchAI SDK (`touchai-sdk`)

The developer-facing product. Installable package in `/sdk`.

```bash
npm install touchai-sdk
```

```js
import { createTouchAI } from 'touchai-sdk'

const touch = await createTouchAI()
const plan = touch.adaptExecution('pulse')
const { response } = await touch.runInference('What hardware am I on?')
```

See [`sdk/README.md`](./sdk/README.md) for the full API.

### TouchAI Device — The Situated Agent

The consumer and prosumer product. An AI agent that lives on your specific machine and develops a genuine understanding of it over time.

- Persistent device profile (sightings, preferred model, query history)
- Persistent conversation memory across visits
- Live 8-layer awareness on this machine

## Site map

| View | Purpose |
|------|---------|
| **Vision** | Problem, axis, market, eight awareness layers, roadmap |
| **SDK** | Install docs + live `adaptExecution` / attestation |
| **Device** | Situated Agent + compounding machine profile |
| **Live** | Hardware-aware inference on this device |

Deep links: `#vision` · `#sdk` · `#device` · `#live`

## Quick start

```bash
npm install
npm run dev
```

Monorepo workspaces: site + `touchai-sdk`.

```bash
npm run sdk:pack   # pack the SDK tarball
```

Deploy via Vercel (`vercel.json` → `dist/`).

## Tech

- `touchai-sdk` — scan · adapt · infer · attest
- Live 8-layer hardware scan (silicon → user)
- Transformers.js / ONNX WASM (Qwen2.5-0.5B)
- Persistent Device profile + memory
- Touch-native UX (cursor, ripples, voice)
