# touchai-sdk

**The touch layer for AI agents.** Hands, not brain.

Any LLM plugs into TouchAI to safely act on real systems — web, APIs, devices.

> Stripe for AI actions. The point of contact between an agent and the real world.

## Install

```bash
npm install ./sdk
# from a clone of github.com/EricSense/TouchAI
```

## Quick start

```js
import { createTouch, createWebAdapter } from 'touchai-sdk'

const touch = createTouch({
  allow: ['web.click', 'web.type', 'web.read', 'web.navigate', 'http.request'],
  requireConfirm: ['http.request'],
  onConfirm: async ({ name, args }) => {
    // gate dangerous actions
    return confirm(`Allow ${name}?`)
  },
  adapters: {
    web: createWebAdapter('#sandbox'), // DOM root the agent may touch
  },
})

// Give these tools to your model (OpenAI shape)
const tools = touch.tools('openai')

// When the model calls a tool:
const result = await touch.act({
  name: 'web.click',
  args: { selector: '#pay' },
})

console.log(result.status, result.result)
console.log(touch.history())
```

## What TouchAI is

| | |
|--|--|
| **Brain** | Your LLM / agent planner |
| **Hands** | TouchAI — `act()`, permissions, adapters, audit |
| **World** | Web UI, HTTP APIs, IoT / robotics bridges, desktop |

## Actions

- `web.click` · `web.type` · `web.navigate` · `web.submit` · `web.read`
- `http.request`
- `device.command` (dry-run until you inject a device bridge)
- `desktop.key` (requires desktop bridge)

## Safety

- `allow` — only listed actions run
- `requireConfirm` + `onConfirm` — human / policy gate
- `history()` — audit trail of every touch

## Philosophy

Most AI is read-only. The frontier is agents that **act**. TouchAI is the interaction layer at the point of contact — so any model can touch the real world without becoming the world.
