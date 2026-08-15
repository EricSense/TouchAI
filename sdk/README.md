# touchai-sdk

**Hardware-aware AI for developers.** Situational intelligence — not smarter models.

Gives every AI model deep knowledge of the hardware it runs on.

## Install

```bash
npm install touchai-sdk
# optional — for WASM on-device generation
npm install @huggingface/transformers
```

Browser apps (Vite / modern bundlers) can also import from the local package in this monorepo:

```js
import {
  scanHardware,
  adaptExecution,
  runInference,
  attestIntegrity,
  createTouchAI,
} from 'touchai-sdk'
```

## Quick start

```js
import { createTouchAI } from 'touchai-sdk'

const touch = await createTouchAI()

// Live 8-layer hardware profile
console.log(touch.hardware.platform, touch.hardware.layers)

// Adapt a model mode to this machine
const plan = touch.adaptExecution('pulse')
// → { backend, quant, maxTokens, latencyTarget, thermal, powerBudget }

// Hardware-aware inference
const { response, latency, plan: used } = await touch.runInference(
  'What hardware am I on?',
)

// Prove where inference ran
const proof = await touch.attestIntegrity()
```

## API

| Call | Purpose |
|------|---------|
| `scanHardware(force?)` | Full 8-layer situational profile |
| `adaptExecution(modelId, hw)` | Backend, quant, token budget for this machine |
| `runInference(query, hw, modelId, history?)` | Hardware-aware generation |
| `attestIntegrity(hw)` | Hardware-rooted attestation |
| `createTouchAI()` | Bound client for one machine session |
| `MemoryStore` | Persistent Situated Agent memory |
| `recordDeviceVisit(hw)` / `situatedSummary(hw)` | Device profile that compounds over time |

### Model modes

`flash` · `pulse` · `depth` — selected automatically from RAM/cores, or pass explicitly.

## Browser requirement

`scanHardware` uses browser APIs (`navigator`, WebGL, Battery, etc.). Run in a browser or browser-like runtime.

## Positioning

As foundation models commoditize, value shifts to deployment. TouchAI SDK is the interface that situates models on real silicon.
