# TouchAI

**The hardware-aware runtime layer for every AI company.**

Every AI product today assumes cloud-first: type a prompt, wait for a server, hope your data stays private. TouchAI is the infrastructure layer that sits between AI applications and silicon — profiling hardware, routing inference locally, and guaranteeing zero egress.

## One runtime. Seven verticals. 34 companies.

| Vertical | Companies | TouchAI Role |
|----------|-----------|--------------|
| **Foundation Models** | OpenAI, Anthropic, xAI, Mistral, Cohere, AI21, Adept, Inflection | Deploy any model on-device with hardware-adaptive routing |
| **AI Infrastructure** | Databricks, Scale AI, CoreWeave, Cerebras, Hugging Face | Edge inference layer below the model stack |
| **Search & Productivity** | Perplexity, Glean, Harvey, Writer, Jasper | Private local RAG — queries never leave the device |
| **AI Coding** | Anysphere, Codeium, Magic, Poolside | IDE agents that know developer hardware |
| **Robotics & Autonomous** | Figure AI, Waymo, Anduril, Shield AI | Sub-100ms on-robot NPU inference |
| **Healthcare AI** | Tempus, Insilico, PathAI, Recursion | HIPAA-aligned on-device — no PHI egress |
| **Video, Audio & Creative** | Runway, Midjourney, Synthesia, ElevenLabs | GPU-aware generation scaled to local VRAM |

## Product

Three views in one app:

1. **Platform** — Startup thesis, stack diagram, vertical overview
2. **Solutions** — Browse all 7 verticals and 38 companies with TouchAI fit for each
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

TouchAI is not competing with OpenAI or Harvey — it's the runtime they deploy on. The layer every AI startup is missing between their model and the user's device.
