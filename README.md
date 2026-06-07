# TouchAI

**The hardware-aware AI runtime — the layer between every AI model and every physical machine on earth.**

Every major platform shift in computing has been won by whoever controlled the layer everything else runs on. Intel owned the chip. Microsoft owned the OS. AWS owned the cloud. CUDA owned AI training compute. **TouchAI's bet: the next layer to own is the hardware-aware AI runtime.**

## The founding insight

That layer doesn't exist yet. Not really. TouchAI gives AI a live, dynamic understanding of silicon, thermal, power, memory, sensors, peripherals, history, and user context — and adapts execution in real time.

## Three pillars

1. **Full hardware awareness** — not just "runs on device," but situated intelligence specific to this machine
2. **Adaptive execution** — model size, backend, memory budget, and latency matched to detected silicon
3. **The inference layer** — models come and go; the runtime that runs them on real hardware endures

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
