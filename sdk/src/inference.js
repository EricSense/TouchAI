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
  return `You are TouchAI Device — the Situated Agent on this machine.

TouchAI builds Hardware-aware AI. You are NOT competing on model smartness.
You are the intelligence that manages all assistants using situational knowledge of this hardware.

LIVE SITUATION:
- Silicon: ${a.silicon.platform} ${a.silicon.arch}, ${a.silicon.cores}, ${a.silicon.gpu}, ${a.silicon.npu}
- Thermal: ${a.thermal.state}, ${a.thermal.headroom}, throttle ${a.thermal.throttleRisk}
- Power: ${a.power.level}, ${a.power.budget}
- Memory: ${a.memory.ram}, ${a.memory.heap ?? a.memory.bandwidth}
- Sensors: ${a.sensors.active}
- History: ${a.history.scans} scans, ${a.history.avgLatency}
- User: ${a.user.rhythm}, ${a.user.signature}

ADAPT PLAN:
- Device: ${plan.device} · Dtype: ${plan.dtype} · Tokens: ${plan.maxTokens}
- Defer heavy local work: ${plan.shouldDefer}
- Reasons: ${(plan.reasons ?? []).join(' · ')}

ASSISTANTS YOU MANAGE:
- Local model — on-device when path is healthy
- Cloud assistant — when thermal/power/depth should defer
- Coding assistant — when user rhythm + RAM allow

When asked to route or decide, recommend an assistant using this situation.
You become the most capable interface on this device because of context no cloud model can acquire — not because you are the smartest model.
Mode: ${model.name}.`;
}

const AGENT = {
  greeting: (hw, plan) =>
    `Situated Agent online on ${hw.platform}. ${hw.layersActive}/8 layers. ` +
    `I manage assistants using this machine's situation — path ${plan?.device}/${plan?.dtype}.`,

  route: (hw, plan) => {
    const pick = plan.shouldDefer || plan.device === 'cpu' ? 'Cloud assistant' : 'Local model';
    return `Routing recommendation for this machine:\n` +
      `→ Prefer **${pick}** right now.\n` +
      `Situation: thermal ${hw.awareness.thermal.state}, power ${hw.awareness.power.budget}, ` +
      `path ${plan.device}/${plan.dtype}, defer=${plan.shouldDefer}.\n` +
      `Reasons: ${(plan.reasons ?? []).join('; ')}`;
  },

  hardware: (hw, plan) => {
    const a = hw.awareness;
    return `Machine situation (what I use to manage assistants):\n\n` +
      `Silicon · ${a.silicon.platform} ${a.silicon.arch} · ${a.silicon.cores} · ${a.silicon.gpu}\n` +
      `Thermal · ${a.thermal.state} · ${a.thermal.headroom}\n` +
      `Power · ${a.power.level} · ${a.power.budget}\n` +
      `Memory · ${a.memory.ram}\n` +
      `Adapt · ${plan?.device}/${plan?.dtype} · ${plan?.maxTokens} tok · defer=${plan?.shouldDefer}`;
  },

  adapt: (hw, plan) =>
    `Hardware-aware plan on ${hw.platform}: ${plan.device} · ${plan.dtype} · ${plan.mode} · ${plan.maxTokens} tok.\n` +
    `${(plan.reasons ?? []).join('\n')}`,

  situation: () =>
    `TouchAI is Hardware-aware AI. Not how smart the model is — how well it understands where it is. ` +
    `I am the Situated Agent: the intelligence that manages assistants with context no cloud model can acquire.`,

  identity: (hw, model, plan) =>
    `I'm TouchAI Device — the Situated Agent on ${hw.platform}. ` +
    `${model.name} via ${plan?.device}/${plan?.dtype}. I manage assistants using live hardware situation.`,

  default: (hw, model, plan) =>
    `Situated Agent · ${hw.platform} · ${plan?.device}/${plan?.dtype} · ${model.name}. ` +
    `Thermal ${hw.awareness.thermal.state} · Power ${hw.awareness.power.level}. Ask me to route a task or read the situation.`,
};

async function agentReply(query, hw, model, plan) {
  const q = query.toLowerCase();
  if (/^(hi|hello|hey|greetings)/.test(q)) return AGENT.greeting(hw, plan);
  if (/route|which assistant|heavy job|should handle|prefer|can we run locally|local(ly)?/.test(q)) {
    return AGENT.route(hw, plan);
  }
  if (/adapt|execution|backend|dtype|webgpu|wasm|plan/.test(q)) return AGENT.adapt(hw, plan);
  if (/hardware|situation|spec|cpu|gpu|ram|npu|layer|machine|what.*running|awareness/.test(q)) {
    return AGENT.hardware(hw, plan);
  }
  if (/situat|commodity|market|deploy|position|capability|hardware-aware|hardware aware|touchai/.test(q)) {
    return AGENT.situation();
  }
  if (/what are you|who are you|vision|why|agent/.test(q)) return AGENT.identity(hw, model, plan);
  if (/attest|integrity|trust|signature/.test(q)) {
    const proof = await attestIntegrity(hw);
    return `Hardware-rooted proof:\nDevice: ${proof.deviceId}\nSig: ${proof.signature}`;
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
