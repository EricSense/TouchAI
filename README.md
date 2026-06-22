# TouchAI

**The hardware-aware AI runtime — the layer between every AI model and every physical machine on earth.**


## The founding insight

 TouchAI gives AI a live, dynamic understanding of silicon, thermal, power, memory, sensors, peripherals, history, and user context — and adapts execution in real time.

## Three pillars

Every view traces back to `js/focus.js`. Live pillar audit shows what's active on your device.

1. **Full hardware awareness** — 8 live layers (Silicon → User)
2. **Adaptive execution** — `adaptExecution()` routes backend, quant, tokens to hardware
3. **The inference layer** — Runtime SDK between models and silicon

## Runtime SDK (`js/runtime-api.js`)

Implements every API in `RUNTIME_API`:

- `scanHardware()` — 8-layer awareness scan
- `adaptExecution(model, hw)` — backend, quant, token budget
- `runInference()` — hardware-aware generation (`inference.js`)
- `attestIntegrity()` — trust layer attestation
- `loadVertical()` — vertical + company metadata

## Five product surfaces

| Surface | Play | Who pays |
|---------|------|----------|
| **Runtime SDK** | The CUDA play | AI companies, app developers |
| **OEM Partnership** | The Dolby play | Device manufacturers |
| **Situated AI Agent** | Intelligence in your machine | Prosumers, developers |
| **Industrial & Edge OS** | The operating layer | Industrial, defense, automotive |
| **Trust & Identity** | Physical root of trust | Regulated enterprises, government |

## Three views + focus path

| Step | View | Purpose |
|------|------|---------|
| 1 | **Platform** | Vision, analogy stack, five surfaces, Runtime SDK |
| 2 | **Solutions** | 7 verticals · 34 companies · hardware gap → With TouchAI |
| 3 | **Live Demo** | Situated inference adapted to this machine |

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
- Adaptive model modes (Flash / Pulse / Depth)
- Vertical-aware system prompts
- Touch-native UX (ripples, cursor, voice, memory, stats)

## Positioning

TouchAI is not competing with OpenAI or Harvey — it's the runtime they integrate. Cloud trains models. TouchAI adapts them to any physical machine.
