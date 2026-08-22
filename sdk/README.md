# touchai-sdk

Hardware-aware AI. **Deploy on any host, anytime.**

Works in the browser and in Node. Same pipeline:

```
Scan → Adapt → Route → Run → Remember
```

```bash
npm install ./sdk
```

```js
import { createTouchAI, deployManifest } from 'touchai-sdk'

const touch = await createTouchAI()
console.log(touch.runtime) // browser | node
console.log(touch.deploy)  // portable targets
await touch.runInference('Can we run locally?')
```
