# TouchAI

**Hands for AI models.**

TouchAI is the action layer between any model (OpenAI, Anthropic, Gemini, …) and the real world. Models decide what to do. TouchAI executes — click, type, call APIs, drive devices — with permissions and an audit trail.

Live: [touchai-kohl.vercel.app](https://touchai-kohl.vercel.app)

## For AI models

```js
import { createTouchForModel, createWebAdapter } from 'touchai-sdk';

const { tools, system, handle } = createTouchForModel('openai', {
  allow: ['web.click', 'web.type', 'web.read'],
  adapters: { web: createWebAdapter(document) },
});

// 1. Give `tools` + `system` to your model
// 2. When it returns tool_calls, run:
const { results, messages } = await handle(assistantMessage);
```

Same SDK works with `anthropic` and `gemini` tool formats.

## Install

```bash
npm install ./sdk
```

See [`sdk/README.md`](./sdk/README.md).

## Develop

```bash
npm install
npm run dev
```
