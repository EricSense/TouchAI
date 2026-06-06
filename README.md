# TouchAI

**The hardware-aware runtime layer for every AI company.**

Every AI product today assumes cloud-first: type a prompt, wait for a server, hope your data stays private. TouchAI is the infrastructure layer that sits between AI applications and silicon — profiling hardware, routing inference locally, and guaranteeing zero egress.

## Product focus

Three pillars — everything we build serves these:

1. **Knows your hardware** — scans CPU, GPU, RAM, NPU, form factor at runtime
2. **Zero egress** — no API calls, no datacenter hop, 0 bytes sent
3. **One runtime, every vertical** — 7 verticals, 34 companies, one layer

## Three views

| View | Purpose |
|------|---------|
| **Platform** | Thesis, live hardware scan, pillars, stack diagram, business model |
| **Solutions** | 7 verticals · 34 companies · cloud problem → TouchAI layer per company |
| **Live Demo** | On-device WASM inference with vertical context and focused prompts |

## Deep links

```
#platform
#solutions/foundation
#demo/healthcare/tempus
```

## Quick start

```bash
npm install
npm run dev
```

Deploy via Vercel (`vercel.json` → `dist/`).

## Tech

- Real hardware scan (CPU, GPU, RAM, NPU, arch)
- Transformers.js / ONNX WASM (Qwen2.5-0.5B)
- Vertical-aware system prompts
- Zero egress inference
- Touch-native UX (ripples, cursor, voice, memory, stats)

## Positioning

TouchAI is not competing with OpenAI or Harvey — it's the runtime they deploy on. The layer every AI startup is missing between their model and the user's device.
