# TouchAI

**Hardware-aware AI** — startup MVP.

TouchAI creates a deep relationship between AI models and their physical host machines. Situational intelligence, not smarter models.

**Live MVP:** [touchai-kohl.vercel.app](https://touchai-kohl.vercel.app)

## What this MVP ships

| Surface | What you get |
|---------|----------------|
| **Product** (`#home`) | Thesis + MVP scope |
| **Try MVP** (`#try`) | Situated Agent prototype on *this* host |
| **SDK** (`#sdk`) | Install path + adaptation playground |

**In the prototype now**
- Live 8-layer hardware scan
- Adapted execution plan (device / dtype / budget)
- Situated Agent with machine-aware routing
- `touchai-sdk` from this repo

**Not in MVP yet**
- Published npm package
- Native desktop agent
- Multi-device fleet

## Run

```bash
npm install
npm run dev
```

Open the app → **Try MVP** to use the Situated Agent on your machine.

## SDK

```bash
npm install ./sdk
```

```js
import { createTouchAI } from 'touchai-sdk'

const touch = await createTouchAI()
const { response, plan } = await touch.runInference('What hardware am I on?')
console.log(plan.device, plan.dtype, response)
```

## Company thesis

Capability races end in commodity. TouchAI positions on **situational intelligence** — how well the AI understands where it is. Models today are homeless; TouchAI gives AI a home. The cloud solved scale. TouchAI is solving depth.
