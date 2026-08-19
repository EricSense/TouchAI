# touchai-sdk

Hardware-aware AI for developers.

## What it does

Gives every AI model deep knowledge of the host it runs on.

## How it works

```
Scan → Adapt → Route → Run → Remember
```

```js
import { createTouchAI } from 'touchai-sdk'

const touch = await createTouchAI()
// touch.hardware — Scan
// touch.plan     — Adapt
// touch.route    — Route
const { response, plan, route } = await touch.runInference('Can we run locally?')
```

## Install

```bash
npm install ./sdk
```

## API

| Call | Step |
|------|------|
| `scanHardware()` | Scan |
| `adaptExecution()` | Adapt |
| `recommendAssistant()` | Route |
| `runInference()` | Run |
| `MemoryStore` / device profile | Remember |

Product: [touchai-kohl.vercel.app](https://touchai-kohl.vercel.app)
