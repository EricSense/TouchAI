# TouchAI

**Hardware-Aware AI.** Situational intelligence — not smarter models.

TouchAI gives every AI model deep knowledge of the hardware it runs on.

**Product:** https://touchai-kohl.vercel.app → **Use**

## What it is

Not a smarter chatbot. Hardware-Aware AI that:

1. Scans the machine (8 layers)
2. Probes real capabilities (WebGPU / WASM)
3. Adapts execution (`device`, `dtype`, tokens)
4. Runs inference on that path

## Use it

```bash
npm install
npm run dev
```

Opens on **Use** — Hardware-Aware AI on your machine.

| Route | What |
|-------|------|
| `#use` | Product — Hardware-Aware AI |
| `#sdk` | Developer SDK + live adapt plan |
| `#why` | Thesis — situational intelligence |

## SDK

```bash
npm install ./sdk
```

```js
import { createTouchAI } from 'touchai-sdk'

const touch = await createTouchAI()
const { response, plan } = await touch.runInference('What hardware am I on?')
// plan.device is webgpu|wasm — runtime honors it
```

See [`sdk/README.md`](./sdk/README.md).

## Products

1. **TouchAI SDK** — Hardware-Aware AI for developers  
2. **TouchAI Device** — Hardware-Aware AI you open and use on a machine  

## Market

As foundation models commoditize, value shifts to deployment. TouchAI sits at that layer.
