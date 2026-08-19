# TouchAI

**The touch layer for AI agents.** Hands, not brain.

An API/SDK for real-world AI agents to take actions — click buttons, fill forms, call APIs, control devices.

> Stripe for AI actions. The point of contact between an agent and the real world.

**Live:** https://touchai-kohl.vercel.app

## Why

Most AI is read-only (chat, generate). The frontier is agents that **act**. TouchAI is the interaction layer any LLM plugs into to safely touch web, desktop, IoT, and robotics APIs.

## Product

| Layer | Role |
|-------|------|
| Your LLM / agent | Brain — plans |
| **TouchAI** | Hands — permissions, actions, adapters, audit |
| Real systems | World — UI, APIs, devices |

## SDK

```bash
npm install
npm run dev
# SDK package: ./sdk → touchai-sdk
```

```js
import { createTouch, createWebAdapter } from 'touchai-sdk'

const touch = createTouch({
  allow: ['web.click', 'web.type', 'web.read', 'http.request'],
  requireConfirm: ['http.request'],
  adapters: { web: createWebAdapter('#world') },
})

const tools = touch.tools('openai') // plug into any model
await touch.act({ name: 'web.click', args: { selector: '#pay' } })
```

See [`sdk/README.md`](./sdk/README.md).

## Site

- Thesis + product stack
- Action catalog
- Playground: sandboxed UI an agent can touch via the same SDK
