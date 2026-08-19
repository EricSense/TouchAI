# touchai-sdk

**Hardware-aware AI for developers.** Infrastructure for a deep relationship between models and their host machines.

Gives every AI model deep knowledge of the hardware it runs on — so deployment stops being homeless.

## Install

```bash
# from a clone of https://github.com/EricSense/TouchAI
npm install ./sdk

# optional — local generation
npm install @huggingface/transformers
```

```js
import { createTouchAI } from 'touchai-sdk'

const touch = await createTouchAI()

// Probed capabilities + adapted plan for THIS host
console.log(touch.capabilities.webgpu, touch.plan.device, touch.plan.dtype)

const { response, plan, engine } = await touch.runInference(
  'What hardware am I on?',
)
```

## What the runtime does

1. **`scanHardware()`** — 8-layer situation (silicon → user) via browser APIs  
2. **`detectCapabilities()`** — probes WebGPU / WASM / WebNN  
3. **`adaptExecution()`** — picks `device`, `dtype`, token budget from the host  
4. **`runInference()`** — loads the model on that device path and generates  

`plan.device` is not a label — `loadModel` passes it to Transformers.js.

## API

| Call | Purpose |
|------|---------|
| `createTouchAI()` | Bound Hardware-Aware AI client |
| `scanHardware()` | 8-layer host profile |
| `detectCapabilities()` | Real WebGPU/WASM probe |
| `adaptExecution(modelId, hw)` | Device + dtype + tokens |
| `runInference(...)` | Adapted generation |
| `attestIntegrity(hw)` | Hardware-rooted proof |
| `canRunLocally(hw, plan)` | Whether local path is viable |
| `MemoryStore` | Persistent machine memory |

## Product

Open [touchai-kohl.vercel.app](https://touchai-kohl.vercel.app) → **SDK** or **Device**.
