# TouchAI

**Hardware-aware AI.** Situational intelligence — not smarter models.

TouchAI gives every AI model deep knowledge of the hardware it runs on.

**Live:** https://touchai-kohl.vercel.app

## The problem

Every AI company positions around capability. That race ends in commodity.

TouchAI positions on a different axis: **situational intelligence** — not how smart the AI is, but how well it understands where it is.

## The market

As foundation models commoditize, value shifts to the layer around them — **deployment**. TouchAI sits there.

## Products

### TouchAI SDK
Developer product. Integrate hardware awareness into applications.

```bash
npm install ./sdk
```

```js
import { createTouchAI } from 'touchai-sdk'
const touch = await createTouchAI()
// touch.hardware — situation
// touch.plan — adapted device/dtype
```

### TouchAI Device — The Situated Agent
Consumer/prosumer product. An agent that lives on your machine, learns it over time, and **manages all assistants** with context no cloud model can acquire.

## Site

| Route | Product |
|-------|---------|
| `#home` | Thesis + roadmap |
| `#sdk` | SDK + adaptation playground |
| `#device` | Situated Agent |

```bash
npm install
npm run dev
```

## FORGE

FORGE is a **separate product** in [`forge/`](./forge). Live: https://forge-lilac-nu.vercel.app — it does not share TouchAI’s app, SDK, or Vercel project.
