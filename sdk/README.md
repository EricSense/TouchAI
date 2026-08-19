# touchai-sdk

TouchAI — hardware-aware AI for developers.

## What it does

Gives AI models deep knowledge of the physical host they run on.

## How it works

```
Scan → Adapt → Route → Run → Remember
```

```js
import { createTouchAI } from 'touchai-sdk'

const touch = await createTouchAI()
console.log(touch.hardware) // Scan
console.log(touch.plan)     // Adapt
console.log(touch.route)    // Route
await touch.runInference('Can we run locally?')
```

```bash
npm install ./sdk
```
