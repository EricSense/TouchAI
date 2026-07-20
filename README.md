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

### TouchAI SDK

The developer-facing product. The interface through which AI developers integrate hardware awareness into their applications.

```js
const hw = await scanHardware()
const plan = adaptExecution(model, hw)
const { response } = await runInference(query, hw, model, history)
const proof = await attestIntegrity(hw)
```

### TouchAI Device — The Situated Agent

The consumer and prosumer product. An AI agent that lives on your specific machine and develops a genuine understanding of it over time.

- **What it does:** The intelligence that manages all assistants
- **The long arc:** As the situated agent learns more about the machine and the user's patterns, it becomes the most capable AI interface on that device — not because it's the smartest model, but because it has context no cloud model can acquire.

## Site map

| View | Purpose |
|------|---------|
| **Vision** | Problem, axis, market, eight awareness layers, roadmap |
| **SDK** | Developer product + live `adaptExecution` / attestation |
| **Device** | Situated Agent story + live machine profile |
| **Live** | Hardware-aware inference on this device |

Deep links: `#vision` · `#sdk` · `#device` · `#live`

## Quick start

```bash
npm install
npm run dev
```

Deploy via Vercel (`vercel.json` → `dist/`).

## Tech

- Live 8-layer hardware scan (silicon → user)
- Adaptive execution (`adaptExecution`)
- Transformers.js / ONNX WASM (Qwen2.5-0.5B)
- Touch-native UX (cursor, ripples, voice, memory)
