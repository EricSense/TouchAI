# touchai-sdk

**Hardware-Aware AI for developers.** Situational intelligence — not smarter models.

Gives every AI model deep knowledge of the hardware it runs on.

## Install

```bash
# from a clone of https://github.com/EricSense/TouchAI
npm install ./sdk

# in your app (after copying or linking the sdk folder)
npm install ./touchai-sdk
npm install @huggingface/transformers   # optional — local generation
```

```js
import { createTouchAI } from 'touchai-sdk'

const touch = await createTouchAI()

// Probed capabilities + adapted plan for THIS machine
console.log(touch.capabilities.webgpu, touch.plan.device, touch.plan.dtype)

const { response, plan, engine } = await touch.runInference(
  'What hardware am I on?',
)
```

## What the runtime actually does

1. **`scanHardware()`** — 8-layer situation (silicon → user) via browser APIs  
2. **`detectCapabilities()`** — probes WebGPU / WASM / WebNN  
3. **`adaptExecution()`** — picks `device`, `dtype`, token budget, deferral from situation  
4. **`runInference()`** — loads the model on that device path (WebGPU → WASM fallback) and generates  

`plan.device` is not a label — `loadModel` passes it to Transformers.js.

## API

| Call | Purpose |
|------|---------|
| `createTouchAI()` | Bound Hardware-Aware AI client |
| `scanHardware()` | 8-layer profile |
| `detectCapabilities()` | Real WebGPU/WASM probe |
| `adaptExecution(modelId, hw)` | Device + dtype + tokens |
| `runInference(...)` | Adapted generation |
| `attestIntegrity(hw)` | Hardware-rooted proof |
| `canRunLocally(hw, plan)` | Whether local path is viable |
| `MemoryStore` | Persistent machine memory |

## Try the product

Open [touchai-kohl.vercel.app](https://touchai-kohl.vercel.app) → **Use**.
