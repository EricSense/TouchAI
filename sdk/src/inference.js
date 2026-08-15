import { adaptExecution, detectCapabilities } from './adapt.js';
import { attestIntegrity } from './attest.js';
import { getModel } from './models.js';
import { recordQuery } from './awareness.js';
import { recordDeviceQuery } from './device-profile.js';
import { scanHardware } from './hardware.js';

let pipeline = null;
let loading = false;
let currentKey = null;
let runtimeDevice = null;

export function getNetworkStats() {
  return { bytesSent: 0, serverCalls: 0, policy: 'hardware-local' };
}

export function getEngineStatus() {
  return {
    runtime: 'TouchAI · Hardware-Aware AI',
    device: runtimeDevice ?? 'probing',
    ready: Boolean(pipeline) || !loading,
    loaded: Boolean(pipeline),
  };
}

function buildSystemPrompt(hw, model, plan) {
  const a = hw.awareness;
  return `You are TouchAI — Hardware-Aware AI on this machine.

You do not compete on model smartness. You compete on situational intelligence: how well you understand the hardware you run on.

LIVE HARDWARE SITUATION:
- Silicon: ${a.silicon.platform} ${a.silicon.arch}, ${a.silicon.cores}, ${a.silicon.gpu}, ${a.silicon.npu}
- Thermal: ${a.thermal.state}, ${a.thermal.headroom}, throttle ${a.thermal.throttleRisk}
- Power: ${a.power.level}, ${a.power.budget}
- Memory: ${a.memory.ram}, ${a.memory.heap ?? a.memory.bandwidth}
- Sensors: ${a.sensors.active}
- Peripherals: ${a.peripherals.connected}
- History: ${a.history.scans} scans, ${a.history.avgLatency}
- User: ${a.user.rhythm}, ${a.user.signature}

ADAPT PLAN (honored by runtime):
- Backend: ${plan.backend}
- Device: ${plan.device}
- Dtype: ${plan.dtype}
- Max tokens: ${plan.maxTokens}
- Reasons: ${(plan.reasons ?? []).join(' · ')}

Context: ${hw.context}
Mode: ${model.name}. Always reference this machine's real hardware when answering.`;
}

const AGENT = {
  greeting: (hw, plan) =>
    `TouchAI · Hardware-Aware AI online on ${hw.platform} (${hw.arch}, ${hw.cores ?? '?'} cores). ` +
    `${hw.layersActive}/8 layers live. Running ${plan?.device ?? 'probing'} · ${plan?.dtype ?? '—'}.`,

  hardware: (hw, plan) => {
    const a = hw.awareness;
    return `Hardware-Aware AI profile (live):\n\n` +
      `Silicon · ${a.silicon.platform} ${a.silicon.arch} · ${a.silicon.cores} · ${a.silicon.gpu} · ${a.silicon.npu}\n` +
      `Thermal · ${a.thermal.state} · ${a.thermal.headroom} · throttle ${a.thermal.throttleRisk}\n` +
      `Power · ${a.power.level} · ${a.power.charging ? 'charging' : 'on battery'} · ${a.power.budget}\n` +
      `Memory · ${a.memory.ram} · ${a.memory.heap ?? ''} · ${a.memory.bandwidth}\n` +
      `Sensors · ${a.sensors.active}\n` +
      `Peripherals · ${a.peripherals.connected}\n` +
      `History · ${a.history.scans} scans · ${a.history.avgLatency}\n` +
      `User · ${a.user.rhythm} · ${a.user.signature}\n\n` +
      `Adapt plan · ${plan?.backend} · ${plan?.device} · ${plan?.dtype} · ${plan?.maxTokens} tok\n` +
      `Why · ${(plan?.reasons ?? []).join(' · ')}`;
  },

  adapt: (hw, plan) =>
    `Hardware-aware execution on ${hw.platform}:\n` +
    `Device: ${plan.device}\nBackend: ${plan.backend}\nDtype: ${plan.dtype}\n` +
    `Mode: ${plan.mode}\nTokens: ${plan.maxTokens}\nLatency target: ${plan.latencyTarget}\n` +
    `Thermal: ${plan.thermal}\nPower: ${plan.powerBudget}\n` +
    `Defer heavy work: ${plan.shouldDefer ? 'yes' : 'no'}\n` +
    `Reasons: ${(plan.reasons ?? []).join('; ')}`,

  situation: (hw) =>
    `TouchAI is Hardware-Aware AI. Not how smart the model is — how well it understands where it is. ` +
    `All ${hw.layersActive} layers active on ${hw.platform}. As models commoditize, value shifts to deployment.`,

  identity: (hw, model, plan) =>
    `I'm TouchAI — Hardware-Aware AI. ${model.name} on ${hw.platform} via ${plan?.device ?? 'local'} (${plan?.dtype}). ` +
    `I situate inference to this silicon, thermal, and power state.`,

  default: (hw, model, plan) => {
    const a = hw.awareness;
    return `[${hw.platform} · ${plan?.device}/${plan?.dtype} · ${model.name}] ` +
      `Hardware-aware reply on ${hw.cores ?? '?'} cores. ` +
      `Thermal ${a.thermal.state} · Power ${a.power.level} · ${hw.layersActive} layers active.`;
  },
};

async function agentReply(query, hw, model, plan) {
  const q = query.toLowerCase();
  if (/^(hi|hello|hey|greetings)/.test(q)) return AGENT.greeting(hw, plan);
  if (/adapt|execution|backend|quant|dtype|webgpu|wasm|plan/.test(q)) return AGENT.adapt(hw, plan);
  if (/hardware|spec|cpu|gpu|ram|npu|layer|device|machine|what.*running|awareness/.test(q)) {
    return AGENT.hardware(hw, plan);
  }
  if (/situat|commodity|market|deploy|position|capability|benchmark|hardware-aware|hardware aware/.test(q)) {
    return AGENT.situation(hw);
  }
  if (/what are you|who are you|touchai|vision|why/.test(q)) return AGENT.identity(hw, model, plan);
  if (/thermal|temperature|throttl|heat/.test(q)) {
    const t = hw.awareness.thermal;
    return `Thermal: ${t.state} · ${t.headroom} · throttle ${t.throttleRisk}. Plan adjusted: ${plan.maxTokens} tok · ${plan.dtype}.`;
  }
  if (/power|battery|charg|energy/.test(q)) {
    const p = hw.awareness.power;
    return `Power: ${p.level} (${p.charging ? 'charging' : 'on battery'}) · ${p.budget}. Plan: ${plan.mode} · ${plan.device}.`;
  }
  if (/attest|integrity|trust|signature/.test(q)) {
    const proof = await attestIntegrity(hw);
    return `Hardware-rooted proof:\nDevice: ${proof.deviceId}\nEnclave: ${proof.enclave}\nSig: ${proof.signature}\nLayers: ${proof.layers}/8`;
  }
  return AGENT.default(hw, model, plan);
}

function pipelineKey(modelId, device, dtype) {
  return `${modelId}|${device}|${dtype}`;
}

export async function loadModel(modelConfig, onProgress, plan = null) {
  const caps = plan?.capabilities ?? await detectCapabilities();
  const device = plan?.device ?? (caps.webgpu ? 'webgpu' : 'wasm');
  const dtype = plan?.dtype ?? 'q8';
  const key = pipelineKey(modelConfig.modelId, device, dtype);

  if (pipeline && currentKey === key) {
    runtimeDevice = device;
    return pipeline;
  }
  if (loading) return null;

  loading = true;
  onProgress?.(`Hardware-Aware AI · loading ${device}/${dtype}…`);

  try {
    const { pipeline: createPipeline, env } = await import('@huggingface/transformers');
    env.allowLocalModels = false;
    env.useBrowserCache = true;

    pipeline = null;
    const opts = {
      dtype,
      device: device === 'webgpu' ? 'webgpu' : 'wasm',
      progress_callback: (info) => {
        if (info.status === 'progress' && info.progress != null) {
          onProgress?.(`${device} · ${Math.round(info.progress)}%`);
        }
      },
    };

    try {
      pipeline = await createPipeline('text-generation', modelConfig.modelId, opts);
    } catch (err) {
      if (device === 'webgpu') {
        onProgress?.('WebGPU unavailable for model — falling back to WASM');
        pipeline = await createPipeline('text-generation', modelConfig.modelId, {
          ...opts,
          device: 'wasm',
          dtype: dtype === 'fp16' ? 'q8' : dtype,
        });
        runtimeDevice = 'wasm';
      } else {
        throw err;
      }
    }

    if (!runtimeDevice) runtimeDevice = device;
    currentKey = key;
    loading = false;
    onProgress?.(`Hardware-Aware AI · ${runtimeDevice} ready`);
    return pipeline;
  } catch (err) {
    loading = false;
    runtimeDevice = null;
    console.warn('Hardware-aware model load:', err);
    onProgress?.('Hardware-Aware AI · rule engine online');
    return null;
  }
}

export async function generate(query, hardware, modelId, history = [], ctx = {}) {
  let plan = await adaptExecution(modelId, hardware);
  const effectiveId = plan.modelId ?? modelId;
  const model = getModel(effectiveId);
  if (effectiveId !== modelId) {
    plan = await adaptExecution(effectiveId, hardware, plan.capabilities);
  }

  const start = performance.now();
  let response;
  let tokens;

  if (!pipeline && !loading) {
    await loadModel(model, ctx.onProgress, plan);
  }

  if (pipeline) {
    try {
      const messages = [
        { role: 'system', content: buildSystemPrompt(hardware, model, plan) },
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

      response = result[0]?.generated_text?.trim() ?? await agentReply(query, hardware, model, plan);
      response = response.split(/<\|im_end\|>|\n/)[0].trim();
      tokens = Math.ceil((prompt.length + response.length) / 4);
    } catch {
      response = await agentReply(query, hardware, model, plan);
      tokens = Math.ceil(response.length / 4);
    }
  } else {
    response = await agentReply(query, hardware, model, plan);
    tokens = Math.ceil(response.length / 4);
  }

  const latency = performance.now() - start;
  recordQuery(latency, effectiveId);
  try {
    recordDeviceQuery(hardware, effectiveId, latency);
  } catch { /* storage blocked */ }

  return {
    response,
    latency,
    tokens,
    network: getNetworkStats(),
    engine: pipeline ? `touchai-hwa+${runtimeDevice ?? plan.device}` : 'touchai-hwa+rules',
    plan,
    ctx,
  };
}

export const runInference = generate;

export function preloadModel(modelId, onProgress) {
  onProgress?.('Hardware-Aware AI · probing device…');
  (async () => {
    const hw = await scanHardware();
    const plan = await adaptExecution(modelId, hw);
    await loadModel(getModel(plan.modelId ?? modelId), onProgress, plan);
  })();
  return Promise.resolve(true);
}

export function isModelReady() {
  return Boolean(pipeline);
}
