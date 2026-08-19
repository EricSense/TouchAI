# TouchAI

**Hardware-aware AI.**

## What it does

TouchAI makes AI know where it is. It creates a deep relationship between AI models and their physical host machines.

Models today are homeless. TouchAI gives them a home on the machine.

## How it works

```
Scan → Adapt → Route → Run → Remember
```

1. **Scan** — read the host (8 layers)  
2. **Adapt** — device, dtype, budget for this machine  
3. **Route** — Local / Cloud / Coding  
4. **Run** — execute with that plan  
5. **Remember** — machine memory for depth  

## Live

[touchai-kohl.vercel.app](https://touchai-kohl.vercel.app)

```bash
npm install
npm run dev
```

## SDK

```bash
npm install ./sdk
```

```js
import { createTouchAI } from 'touchai-sdk'

const touch = await createTouchAI()
await touch.runInference('What is my hardware situation?')
```
