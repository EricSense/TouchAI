# TouchAI

**Hardware-aware AI.**

## What TouchAI does

TouchAI makes AI hardware-aware. It creates a deep relationship between AI models and their physical host machines — so a model knows where it is, what the machine can do right now, and how to run on it.

- Knows the host (silicon, thermal, power, memory, sensors, history, usage)
- Adapts execution (device path, dtype, budget)
- Routes work (Local / Cloud / Coding from live situation)
- Compounds depth (machine memory over time)

Capability races end in commodity. TouchAI positions on **situational intelligence** — not how smart the AI is, but how well it understands where it is. Models today are homeless; TouchAI gives AI a home. The cloud solved scale; TouchAI solves depth.

## How TouchAI works

```
Scan → Adapt → Route → Run → Remember
```

| Step | Meaning |
|------|---------|
| **Scan** | Read 8 layers of host situation |
| **Adapt** | Plan device / dtype / tokens for this machine |
| **Route** | Pick Local, Cloud, or Coding assistant |
| **Run** | Execute with that plan |
| **Remember** | Store machine memory for depth |

## Prototype & SDK

**Live:** [touchai-kohl.vercel.app](https://touchai-kohl.vercel.app)

| Route | Purpose |
|-------|---------|
| `#home` | What & How |
| `#try` | Situated Agent on this host |
| `#sdk` | Developer SDK |

```bash
npm install
npm run dev
```

```bash
npm install ./sdk
```

```js
import { createTouchAI } from 'touchai-sdk'

const touch = await createTouchAI()
// touch.hardware  — scan
// touch.plan      — adapt
// touch.route     — route
await touch.runInference('Can we run locally?')
```
