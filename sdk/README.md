# touchai-sdk

Give AI models hands. TouchAI is the action layer between any model and the real world.

Models decide. TouchAI executes — with permissions, adapters, and an audit trail.

## Install

```bash
npm install ./sdk
```

## Quick start — for any AI model

```js
import { createTouch, createWebAdapter } from 'touchai-sdk';

const touch = createTouch({
  allow: ['web.click', 'web.type', 'web.read', 'http.request'],
  adapters: { web: createWebAdapter(document) },
});

// Tools in the shape your model expects
const tools = touch.tools('openai');     // or 'anthropic' | 'gemini'
const system = touch.systemPrompt();

// After the model returns tool_calls:
const model = touch.forModel('openai');
const { results, messages } = await model.handle(response.choices[0].message);
```

## One-liner for a provider

```js
import { createTouchForModel, createWebAdapter } from 'touchai-sdk';

const { tools, system, handle } = createTouchForModel('openai', {
  allow: ['web.click', 'web.type', 'web.read'],
  adapters: { web: createWebAdapter(document) },
});

// tools → send to model
// handle(assistantMessage) → run tool_calls through TouchAI
```

## Supported model formats

| Provider   | `tools()` shape                         | `handle()` input                          |
|-----------|------------------------------------------|-------------------------------------------|
| `openai`  | `{ type:'function', function:{...} }`    | message with `tool_calls`                 |
| `anthropic` | `{ name, description, input_schema }`  | message with `content` tool_use blocks    |
| `gemini`  | `{ functionDeclarations:[...] }`         | `functionCall` / `functionCalls`          |

Same action surface for all: `web.*`, `http.request`, `device.command`, `desktop.key`.

## Direct act (no model)

```js
await touch.act({ type: 'web.click', target: '#buy' });
await touch.actMany([
  { type: 'web.type', target: '#email', text: 'a@b.com' },
  { type: 'web.click', target: '#submit' },
]);
```

## Permissions

```js
createTouch({
  allow: ['web.click', 'web.type', 'http.request'],
  requireConfirm: ['http.request'],
  onConfirm: async (action) => window.confirm(`Allow ${action.type}?`),
});
```

## Model bridge helpers

```js
import { extractToolCalls, handleToolCalls, appendToolResults } from 'touchai-sdk';

const calls = extractToolCalls(assistantMessage, 'openai');
const { results } = await handleToolCalls(touch, calls);
const next = appendToolResults(messages, assistantMessage, results, 'openai');
```
