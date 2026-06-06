# TouchAI

**The hardware-aware runtime layer for every AI company.**

Every AI product today assumes cloud-first: type a prompt, wait for a server, hope your data stays private. TouchAI is the infrastructure layer that sits between AI applications and silicon — profiling hardware, routing inference locally, and guaranteeing zero egress.


## Product

Three views in one app:

1. **Platform** — Startup thesis, stack diagram, vertical overview
2. **Solutions** — Browse all 7 verticals and 34 companies with TouchAI fit for each
3. **Live Demo** — Hardware-aware inference running on YOUR machine via WASM

## Quick start

```bash
npm install
npm run dev
```

## Tech

- Real hardware scan (CPU, GPU, RAM, NPU inference, arch)
- Transformers.js / ONNX WASM (Qwen2.5-0.5B)
- Vertical-aware system prompts
- Zero egress inference
- Touch-native UX (ripples, cursor, voice)

## Positioning

TouchAI is the runtime they deploy on. The layer every AI startup is missing between their model and the user's device.
