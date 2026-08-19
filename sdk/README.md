# touchai-sdk

**Hardware-aware AI SDK** — MVP for developers.

Give any model a relationship with its host machine: scan → adapt → run.

## Install (MVP)

```bash
# from a clone of https://github.com/EricSense/TouchAI
npm install ./sdk
npm install @huggingface/transformers   # optional — local generation
```

```js
import { createTouchAI } from 'touchai-sdk'

const touch = await createTouchAI()
console.log(touch.plan.device, touch.plan.dtype)

const { response, plan } = await touch.runInference('What hardware am I on?')
```

## Runtime

1. `scanHardware()` — 8-layer host situation  
2. `detectCapabilities()` — WebGPU / WASM / WebNN  
3. `adaptExecution()` — device, dtype, tokens  
4. `runInference()` — generate on the adapted path  

## Product

[touchai-kohl.vercel.app](https://touchai-kohl.vercel.app) → **Try MVP** or **SDK**
