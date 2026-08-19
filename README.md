# TouchAI

**Hardware-aware AI.** Situational intelligence — not smarter models.

TouchAI creates a deep relationship between AI models and their physical host machines. By making AI hardware-intelligent, we unlock critical capabilities — and TouchAI is the company building the infrastructure for it.

**Live:** https://touchai-kohl.vercel.app

## The problem with how AI is positioned today

Every AI company positions around capability. Smarter models. Faster responses. More parameters. Better benchmarks.

That race has one destination — a commodity. When every model is smart enough, smart enough stops being a differentiator.

TouchAI doesn’t play that game.

## A different axis

TouchAI positions around **situational intelligence**.

Not how smart is the AI — but how well does the AI understand where it is.

TouchAI is building Hardware-aware AI that gives every AI model deep knowledge of the hardware it runs on.

## Giving AI a home

Right now, every AI model is essentially homeless. It gets deployed wherever and has no real relationship with that environment. It doesn’t know what it’s capable of on the machine, right now.

TouchAI is essentially giving AI a home.

The cloud solved scale. TouchAI is solving depth.

AI that knows your hardware starts to build a model of how you use that machine. That changes everything — and makes TouchAI possible.

## Products

### TouchAI SDK
Developer infrastructure. Integrate hardware awareness so any model knows its host.

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
An agent that lives on your machine, learns it over time, and manages assistants with depth no cloud model can acquire.

## Site

| Route | Product |
|-------|---------|
| `#home` | Thesis |
| `#sdk` | SDK + adaptation playground |
| `#device` | Situated Agent |

```bash
npm install
npm run dev
```
