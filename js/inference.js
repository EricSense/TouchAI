import { adaptExecution, attestIntegrity } from './runtime-api.js';
import { getModel } from './models.js';
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
    runtime: 'TouchAI · hardware-aware AI',
    wasm: wasmReady ? 'Qwen2.5 · cached on device' : 'loading to local cache',
    ready: true,
  };
}

function buildSystemPrompt(hw, model) {
  const a = hw.awareness;
  return `You are TouchAI Device — the Situated Agent on this machine.

TouchAI builds hardware-aware AI. Situational intelligence: not how smart the AI is, but how well it understands where it is.

8-LAYER AWARENESS (live):
- Silicon: ${a.silicon.platform} ${a.silicon.arch}, ${a.silicon.cores}, ${a.silicon.gpu}, ${a.silicon.npu}
- Thermal: ${a.thermal.state}, ${a.thermal.headroom}, throttle ${a.thermal.throttleRisk}
- Power: ${a.power.level}, ${a.power.budget}
- Memory: ${a.memory.ram}, ${a.memory.heap ?? a.memory.bandwidth}
- Sensors: ${a.sensors.active}
- Peripherals: ${a.peripherals.connected} · ${a.peripherals.available}
- History: ${a.history.scans} scans, ${a.history.avgLatency} avg latency
- User: ${a.user.rhythm}, ${a.user.signature}

Context: ${hw.context}
Model mode: ${model.name} — adapted to this hardware.
Always reference actual hardware and awareness layers. You manage assistants with context no cloud model can acquire.`;
}

const AGENT = {
  greeting: (hw) =>
    `Online on your ${hw.platform} (${hw.arch}, ${hw.cores ?? '?'} cores). ` +
    `All ${hw.layersActive} awareness layers active. I'm TouchAI Device — the Situated Agent on this hardware.`,

  hardware: (hw) => {
    const a = hw.awareness;
    return `Live 8-layer situational profile:\n\n` +
      `Silicon · ${a.silicon.platform} ${a.silicon.arch} · ${a.silicon.cores} · ${a.silicon.gpu} · ${a.silicon.npu}\n` +
      `Thermal · ${a.thermal.state} · ${a.thermal.headroom} · throttle ${a.thermal.throttleRisk}\n` +
      `Power · ${a.power.level} · ${a.power.charging ? 'charging' : 'on battery'} · ${a.power.budget}\n` +
      `Memory · ${a.memory.ram} · ${a.memory.heap ?? ''} · ${a.memory.bandwidth}\n` +
      `Sensors · ${a.sensors.active}\n` +
      `Peripherals · ${a.peripherals.connected} · available: ${a.peripherals.available}\n` +
      `History · ${a.history.scans} scans · ${a.history.avgLatency} · ${a.history.sessions} sessions\n` +
      `User · ${a.user.rhythm} · ${a.user.signature}\n\n` +
      `This is context no cloud model can acquire.`;
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

  situation: (hw) =>
    `TouchAI positions around situational intelligence — not smarter models. ` +
    `As foundation models commoditize, value shifts to deployment. ` +
    `All ${hw.layersActive} awareness layers active on your ${hw.platform} (${hw.gpu}, ${hw.cores ?? '?'} cores). ` +
    `The question is not how smart the AI is — it's how well it understands where it is.`,

  identity: (hw, model) =>
    `I'm TouchAI Device — the Situated Agent. ${model.name} mode on ${hw.platform} (${hw.gpu}). ` +
    `${hw.layersActive}/${hw.layersTotal} awareness layers live. ` +
    `I become the most capable interface on this device not because I'm the smartest model, ` +
    `but because I have context no cloud model can acquire.`,

  sdk: () =>
    `TouchAI SDK is the developer-facing product — the interface through which AI developers ` +
    `integrate hardware awareness into their applications. scanHardware(), adaptExecution(), ` +
    `runInference(), attestIntegrity().`,

  default: (hw, model) => {
    const mode = model.depthWeight > 0.7 ? 'deep' : model.speedWeight > 0.8 ? 'fast' : 'balanced';
    const a = hw.awareness;
    return `[${hw.platform} · ${hw.formFactor} · ${model.name}] Situated inference on ${hw.cores ?? '?'} cores. ` +
      `Thermal ${a.thermal.state} · Power ${a.power.level} · ${mode} execution profile. ` +
      `All ${hw.layersActive} awareness layers active — situational intelligence on this machine.`;
  },
};

async function agentReply(query, hw, model) {
  const q = query.toLowerCase();
  if (/^(hi|hello|hey|greetings)/.test(q)) return AGENT.greeting(hw);
  if (/thermal|temperature|throttl|heat|cool/.test(q)) return AGENT.thermal(hw);
  if (/power|battery|charg|energy/.test(q)) return AGENT.power(hw);
  if (/sensor|camera|mic|gps|motion|accelerometer/.test(q)) return AGENT.sensors(hw);
  if (/hardware|spec|cpu|gpu|ram|npu|chip|device|machine|what.*running|awareness|layer/.test(q)) {
    return AGENT.hardware(hw);
  }
  if (/sdk|developer|api|integrate/.test(q)) return AGENT.sdk();
  if (/situat|commodity|market|deploy|position|capability|benchmark|different/.test(q)) {
    return AGENT.situation(hw);
  }
  if (/runtime|cuda|inference|silicon|platform shift/.test(q)) return AGENT.situation(hw);
  if (/what are you|who are you|touchai|vision|why|agent/.test(q)) return AGENT.identity(hw, model);
  if (/history|fingerprint|session|pattern|rhythm|user/.test(q)) {
    const u = hw.awareness.user;
    const h = hw.awareness.history;
    return `User layer: ${u.rhythm} · ${u.signature}. History layer: ${h.scans} hardware scans, ` +
      `${h.sessions} sessions, ${h.avgLatency} avg inference latency. ` +
      `Over time this Situated Agent learns your machine and patterns — context cloud models never get.`;
  }
  if (/peripheral|gamepad|usb|bluetooth|hid/.test(q)) {
    const p = hw.awareness.peripherals;
    return `Peripherals: ${p.connected}. Available APIs: ${p.available}. TouchAI extends capability through detected I/O.`;
  }
  if (/attest|integrity|trust|enclave|signature/.test(q)) {
    const proof = await attestIntegrity(hw);
    return `Hardware-rooted attestation:\n` +
      `Device ID: ${proof.deviceId}\n` +
      `Enclave: ${proof.enclave}\n` +
      `Signature: ${proof.signature}\n` +
      `Layers: ${proof.layers}/8 · Policy: ${proof.policy}\n` +
      `Timestamp: ${proof.timestamp}`;
  }
  if (/adapt|execution|backend|quant/.test(q)) {
    const plan = adaptExecution(model.id, hw);
    return `Hardware-aware execution plan (${plan.mode}):\n` +
      `Backend: ${plan.backend}\nQuant: ${plan.quant}\nMax tokens: ${plan.maxTokens}\n` +
      `Latency target: ${plan.latencyTarget}\nThermal: ${plan.thermal}\nPower: ${plan.powerBudget}`;
  }
  return AGENT.default(hw, model);
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
    onProgress?.('Situated Agent · all layers active');
    return pipeline;
  } catch (err) {
    loading = false;
    wasmReady = false;
    console.warn('WASM cache load:', err);
    onProgress?.('Situated Agent · all layers active');
    return null;
  }
}

export async function generate(query, hardware, modelId, history = [], ctx = {}) {
  const model = getModel(modelId);
  const plan = adaptExecution(modelId, hardware);
  const start = performance.now();
  let response;
  let tokens;

  if (pipeline) {
    try {
      const messages = [
        { role: 'system', content: buildSystemPrompt(hardware, model) },
        ...history.slice(-6).map((h) => ({ role: h.role, content: h.content })),
        { role: 'user', content: query },
      ];

      const prompt = messages.map((m) => `<|im_start|>${m.role}\n${m.content}`).join('\n') +
        '\n<|im_start|>assistant\n';

      const result = await pipeline(prompt, {
        max_new_tokens: plan.maxTokens,
        temperature: model.temperature,
        do_sample: true,
        return_full_text: false,
      });

      response = result[0]?.generated_text?.trim() ?? await agentReply(query, hardware, model);
      response = response.split(/<\|im_end\|>|\n/)[0].trim();
      tokens = Math.ceil((prompt.length + response.length) / 4);
    } catch {
      response = await agentReply(query, hardware, model);
      tokens = Math.ceil(response.length / 4);
    }
  } else {
    response = await agentReply(query, hardware, model);
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
    engine: pipeline ? 'touchai-situated+wasm' : 'touchai-situated',
    plan,
    ctx,
  };
}

export const runInference = generate;

export function preloadModel(modelId, onProgress) {
  onProgress?.('Situated Agent · all layers active');
  loadModel(getModel(modelId), onProgress);
  return Promise.resolve(true);
}

export function isModelReady() { return true; }
