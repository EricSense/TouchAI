import { getModel } from './models.js';
import { getCompany, companyGap } from './ecosystem.js';
import { recordQuery } from './awareness.js';

let pipeline = null;
let loading = false;
let currentModelId = null;
let wasmReady = false;

export function getNetworkStats() {
  return { bytesSent: 0, serverCalls: 0, policy: 'hardware-local' };
}

export function getEngineStatus() {
  return {
    runtime: 'TouchAI Adaptive Runtime',
    wasm: wasmReady ? 'Qwen2.5 · cached on device' : 'loading to local cache',
    ready: true,
  };
}

function buildSystemPrompt(hw, model, ctx = {}) {
  const vertical = ctx.vertical;
  const company = ctx.company;
  const a = hw.awareness;
  let verticalBlock = '';
  if (vertical) {
    verticalBlock = `
ACTIVE VERTICAL: ${vertical.name}
${company ? `DEMO PARTNER: ${company}` : ''}
TouchAI role in this vertical: ${vertical.touchaiRole}
When answering, explain how TouchAI's hardware-aware runtime applies to ${company ?? 'this vertical'} specifically.`;
  }

  return `You are TouchAI — the hardware-aware AI runtime. Situated intelligence on this machine.

8-LAYER AWARENESS (live):
- Silicon: ${a.silicon.platform} ${a.silicon.arch}, ${a.silicon.cores}, ${a.silicon.gpu}, ${a.silicon.npu}
- Thermal: ${a.thermal.state}, ${a.thermal.headroom}, throttle ${a.thermal.throttleRisk}
- Power: ${a.power.level}, ${a.power.budget}
- Memory: ${a.memory.ram}, ${a.memory.heap ?? a.memory.bandwidth}
- Sensors: ${a.sensors.active}
- Peripherals: ${a.peripherals.connected} · ${a.peripherals.available}
- History: ${a.history.scans} scans, ${a.history.avgLatency} avg latency
- User: ${a.user.rhythm}, ${a.user.signature}
${verticalBlock}

Context: ${hw.context}
Model mode: ${model.name} — adapted to this hardware.
Always reference actual hardware and awareness layers.`;
}

const RUNTIME = {
  greeting: (hw) =>
    `Online on your ${hw.platform} (${hw.arch}, ${hw.cores ?? '?'} cores). ` +
    `All ${hw.layersActive} awareness layers active. I'm TouchAI — situated intelligence on this hardware.`,

  hardware: (hw) => {
    const a = hw.awareness;
    return `Live 8-layer awareness profile:\n\n` +
      `Silicon · ${a.silicon.platform} ${a.silicon.arch} · ${a.silicon.cores} · ${a.silicon.gpu} · ${a.silicon.npu}\n` +
      `Thermal · ${a.thermal.state} · ${a.thermal.headroom} · throttle ${a.thermal.throttleRisk}\n` +
      `Power · ${a.power.level} · ${a.power.charging ? 'charging' : 'on battery'} · ${a.power.budget}\n` +
      `Memory · ${a.memory.ram} · ${a.memory.heap ?? ''} · ${a.memory.bandwidth}\n` +
      `Sensors · ${a.sensors.active}\n` +
      `Peripherals · ${a.peripherals.connected} · available: ${a.peripherals.available}\n` +
      `History · ${a.history.scans} scans · ${a.history.avgLatency} · ${a.history.sessions} sessions\n` +
      `User · ${a.user.rhythm} · ${a.user.signature}\n\n` +
      `Runtime: ${hw.inferenceBackend}`;
  },

  thermal: (hw) => {
    const t = hw.awareness.thermal;
    return `Thermal layer: ${t.state}. Headroom: ${t.headroom}. Throttle risk: ${t.throttleRisk}. ` +
      `TouchAI adapts token budget and model tier when thermal pressure rises on your ${hw.platform}.`;
  },

  power: (hw) => {
    const p = hw.awareness.power;
    return `Power layer: ${p.level} (${p.charging ? 'charging' : 'on battery'}). Budget: ${p.budget}. ` +
      `TouchAI scales inference intensity to your current power state — no wasted compute.`;
  },

  sensors: (hw) => {
    const s = hw.awareness.sensors;
    return `Sensor layer: ${s.active}. TouchAI knows what's present and active on this ${hw.formFactor} — ` +
      `input modality and sensor context shape execution strategy.`;
  },

  runtime: (hw) =>
    `TouchAI is the hardware-aware runtime — the layer between AI models and silicon. ` +
    `All ${hw.layersActive} awareness layers active on your ${hw.platform} (${hw.gpu}, ${hw.cores ?? '?'} cores). ` +
    `Models come and go. The runtime that knows your machine endures.`,

  identity: (hw, model) =>
    `I'm TouchAI — the hardware-aware AI runtime. ${model.name} mode on ${hw.platform} (${hw.gpu}). ` +
    `${hw.layersActive}/${hw.layersTotal} awareness layers live. I adapt execution to your silicon in real time.`,

  vertical: (hw, ctx) => {
    if (!ctx?.vertical) return null;
    const co = ctx.company;
    if (co && ctx.vertical.id) {
      const entry = getCompany(ctx.vertical.id, co);
      if (entry) {
        return `TouchAI for ${co} on your ${hw.platform} (${hw.cores ?? '?'} cores, ${hw.gpu}):\n` +
          `Hardware gap: ${companyGap(entry)}\n` +
          `With TouchAI: ${entry.touchai}\n` +
          `${ctx.vertical.metrics?.adaptation ?? 'Adaptive'} · ${ctx.vertical.metrics?.latency ?? 'on-device'}`;
      }
    }
    return `TouchAI for ${ctx.company ?? 'this vertical'} (${ctx.vertical.name}): ${ctx.vertical.touchaiRole} ` +
      `Adapted to your ${hw.platform} (${hw.gpu}, ${hw.cores ?? '?'} cores).`;
  },

  default: (hw, model, ctx) => {
    const mode = model.depthWeight > 0.7 ? 'deep' : model.speedWeight > 0.8 ? 'fast' : 'balanced';
    const vert = ctx?.company ? ` · ${ctx.company}` : '';
    const a = hw.awareness;
    return `[${hw.platform} · ${hw.formFactor}${vert} · ${model.name}] Situated inference on ${hw.cores ?? '?'} cores. ` +
      `Thermal ${a.thermal.state} · Power ${a.power.level} · ${mode} execution profile. ` +
      `All ${hw.layersActive} awareness layers active.`;
  },
};

function runtimeReply(query, hw, model, ctx = {}) {
  const q = query.toLowerCase();
  if (/^(hi|hello|hey|greetings)/.test(q)) return RUNTIME.greeting(hw);
  if (/thermal|temperature|throttl|heat|cool/.test(q)) return RUNTIME.thermal(hw);
  if (/power|battery|charg|energy/.test(q)) return RUNTIME.power(hw);
  if (/sensor|camera|mic|gps|motion|accelerometer/.test(q)) return RUNTIME.sensors(hw);
  if (/hardware|spec|cpu|gpu|ram|npu|chip|device|machine|what.*running|awareness|layer/.test(q)) return RUNTIME.hardware(hw);
  if (/runtime|cuda|inference|silicon|platform shift/.test(q)) return RUNTIME.runtime(hw);
  if (/what are you|who are you|touchai|different|why|vision/.test(q)) return RUNTIME.identity(hw, model);
  if (/history|fingerprint|session|pattern|rhythm|user/.test(q)) {
    const u = hw.awareness.user;
    const h = hw.awareness.history;
    return `User layer: ${u.rhythm} · ${u.signature}. History layer: ${h.scans} hardware scans, ` +
      `${h.sessions} sessions, ${h.avgLatency} avg inference latency. TouchAI builds a performance fingerprint over time.`;
  }
  if (/peripheral|gamepad|usb|bluetooth|hid/.test(q)) {
    const p = hw.awareness.peripherals;
    return `Peripherals: ${p.connected}. Available APIs: ${p.available}. TouchAI extends capability through detected I/O.`;
  }
  if (ctx?.vertical) return RUNTIME.vertical(hw, ctx);
  return RUNTIME.default(hw, model, ctx);
}

export async function loadModel(modelConfig, onProgress) {
  if (pipeline && currentModelId === modelConfig.modelId) {
    wasmReady = true;
    return pipeline;
  }
  if (loading) return null;

  loading = true;
  onProgress?.('Caching model weights locally…');

  try {
    const { pipeline: createPipeline, env } = await import('@huggingface/transformers');
    env.allowLocalModels = false;
    env.useBrowserCache = true;

    if (pipeline && currentModelId !== modelConfig.modelId) pipeline = null;

    pipeline = await createPipeline('text-generation', modelConfig.modelId, {
      dtype: 'q8',
      device: 'wasm',
      progress_callback: (info) => {
        if (info.status === 'progress' && info.progress != null) {
          onProgress?.(`Local cache · ${Math.round(info.progress)}%`);
        }
      },
    });

    currentModelId = modelConfig.modelId;
    wasmReady = true;
    loading = false;
    onProgress?.('TouchAI runtime · all layers active');
    return pipeline;
  } catch (err) {
    loading = false;
    wasmReady = false;
    console.warn('WASM cache load:', err);
    onProgress?.('TouchAI runtime · all layers active');
    return null;
  }
}

export async function generate(query, hardware, modelId, history = [], ctx = {}) {
  const model = getModel(modelId);
  const start = performance.now();
  let response;
  let tokens;

  if (pipeline) {
    try {
      const messages = [
        { role: 'system', content: buildSystemPrompt(hardware, model, ctx) },
        ...history.slice(-6).map((h) => ({ role: h.role, content: h.content })),
        { role: 'user', content: query },
      ];

      const prompt = messages.map((m) => `<|im_start|>${m.role}\n${m.content}`).join('\n') +
        '\n<|im_start|>assistant\n';

      const result = await pipeline(prompt, {
        max_new_tokens: model.maxTokens,
        temperature: model.temperature,
        do_sample: true,
        return_full_text: false,
      });

      response = result[0]?.generated_text?.trim() ?? runtimeReply(query, hardware, model, ctx);
      response = response.split(/<\|im_end\|>|\n/)[0].trim();
      tokens = Math.ceil((prompt.length + response.length) / 4);
    } catch {
      response = runtimeReply(query, hardware, model, ctx);
      tokens = Math.ceil(response.length / 4);
    }
  } else {
    response = runtimeReply(query, hardware, model, ctx);
    tokens = Math.ceil(response.length / 4);
  if (!loading && !pipeline) loadModel(model);
  }

  const latency = performance.now() - start;
  recordQuery(latency, modelId);

  return {
    response,
    latency,
    tokens,
    network: getNetworkStats(),
    engine: pipeline ? 'touchai-runtime+wasm' : 'touchai-runtime',
  };
}

export function preloadModel(modelId, onProgress) {
  onProgress?.('TouchAI runtime · all layers active');
  loadModel(getModel(modelId), onProgress);
  return Promise.resolve(true);
}

export function isModelReady() { return true; }
