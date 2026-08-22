# TouchAI

**Hardware-aware AI.** Deploy anywhere, anytime.

## What it does

TouchAI makes AI know where it is — a deep relationship between models and their physical host machines.

## How it works

```
Scan → Adapt → Route → Run → Remember
```

## Deploy anywhere · anytime

| Target | Command |
|--------|---------|
| Node (any host) | `npm run build && npm start` |
| Docker | `docker compose up --build` |
| Vercel | `vercel --prod` |
| Netlify | `netlify deploy --prod --dir=dist` |
| Render | blueprint in `render.yaml` |
| Fly.io | `fly deploy` |
| Embed SDK | `npm install ./sdk` → `createTouchAI()` |

Live: [touchai-kohl.vercel.app](https://touchai-kohl.vercel.app)

```bash
npm install
npm run build
npm start
# → http://localhost:4173
```

## SDK

```js
import { createTouchAI } from 'touchai-sdk'

const touch = await createTouchAI() // browser or Node
console.log(touch.deploy)           // anywhere · anytime targets
await touch.runInference('How do I deploy anywhere?')
```
