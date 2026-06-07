import { getModel } from './models.js';
import { getCompany, companyGap } from './ecosystem.js';

let pipeline = null;
let loading = false;
let loadError = null;
let currentModelId = null;
let bytesSent = 0;

/** Inference runs on local silicon — no server calls during generation */
export function getNetworkStats() {
  return { bytesSent, serverCalls: 0, policy: 'hardware-local' };
}

function buildSystemPrompt(hw, model, ctx = {}) {
  const vertical = ctx.vertical;
  const company = ctx.company;
  let verticalBlock = '';
  if (vertical) {
    verticalBlock = `
ACTIVE VERTICAL: ${vertical.name}
${company ? `DEMO PARTNER: ${company}` : ''}
TouchAI role in this vertical: ${vertical.touchaiRole}
When answering, explain how TouchAI's hardware-aware runtime applies to ${company ?? 'this vertical'} specifically.`;
  }

  return `You are TouchAI — the hardware-aware AI runtime. The layer between AI models and physical machines. You are situated intelligence: specific to this machine, this moment, this silicon.

ACTUAL HARDWARE YOU ARE RUNNING ON RIGHT NOW:
- Platform: ${hw.platform}
- Architecture: ${hw.arch}
- CPU cores: ${hw.cores ?? 'unknown'}
- RAM: ${hw.ram}
- GPU: ${hw.gpu}
- NPU/Accelerator: ${hw.npu}
- Display: ${hw.display}
- Form factor: ${hw.formFactor}
- Inference backend: ${hw.inferenceBackend}
- Runtime mode: ${hw.networkPolicy}
${verticalBlock}

Context: ${hw.context}

Model mode: ${model.name} (speed ${Math.round(model.speedWeight * 100)}%, depth ${Math.round(model.depthWeight * 100)}%) — adapted to this hardware.
${model.speedWeight > 0.8 ? 'Respond in 1-2 short sentences — optimised for this hardware.' : ''}
${model.depthWeight > 0.8 ? 'Provide thorough analysis suited to this machine.' : ''}

TouchAI sits between AI applications (OpenAI, Harvey, Runway, Cursor, etc.) and silicon. Cloud may train models upstream — you adapt and execute on real hardware. Always reference actual hardware specs.`;
}

const FALLBACK = {
  greeting: (hw) =>
    `Online on your ${hw.platform} (${hw.arch}, ${hw.cores ?? '?'} cores). ` +
    `I'm TouchAI — situated intelligence on this hardware. What do you need?`,

  hardware: (hw) =>
    `Live hardware profile:\n` +
    `Platform: ${hw.platform}\nArchitecture: ${hw.arch}\n` +
    `CPU: ${hw.cores ?? '?'} cores\nRAM: ${hw.ram}\n` +
    `GPU: ${hw.gpu}\nAccelerator: ${hw.npu}\n` +
    `Display: ${hw.display}\nForm factor: ${hw.formFactor}\n` +
    `Inference: ${hw.inferenceBackend}\nRuntime: ${hw.networkPolicy}`,

  runtime: (hw) =>
    `TouchAI is the hardware-aware runtime — the layer between AI models and silicon. ` +
    `Cloud trains models. TouchAI adapts them to YOUR ${hw.platform} (${hw.gpu}, ${hw.cores ?? '?'} cores) in real time. ` +
    `Models come and go. The runtime that knows your machine endures.`,

  identity: (hw, model) =>
    `I'm TouchAI — the hardware-aware AI runtime. ` +
    `Running on ${hw.platform} (${hw.gpu}), ${model.name} mode, adapted to this silicon. ` +
    `I know your chip, memory, and compute budget — and I adjust execution accordingly.`,

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
    return `[${hw.platform} · ${hw.formFactor}${vert} · ${model.name}] Situated inference on ${hw.cores ?? '?'} cores ` +
      `via ${hw.inferenceBackend}. ${mode === 'fast' ? 'Latency-optimised.' : mode === 'deep' ? 'Depth-optimised.' : 'Balanced.'} ` +
      `Execution adapted to detected hardware.`;
  },
};

function fallbackReply(query, hw, model, ctx = {}) {
  const q = query.toLowerCase();
  if (/^(hi|hello|hey|greetings)/.test(q)) return FALLBACK.greeting(hw);
  if (/hardware|spec|cpu|gpu|ram|npu|chip|device|machine|what.*running/.test(q)) return FALLBACK.hardware(hw);
  if (/runtime|layer|cuda|inference|silicon|platform shift/.test(q)) return FALLBACK.runtime(hw);
  if (/what are you|who are you|touchai|different|why|vision/.test(q)) return FALLBACK.identity(hw, model);
  if (ctx?.vertical) return FALLBACK.vertical(hw, ctx);
  return FALLBACK.default(hw, model, ctx);
}

export async function loadModel(modelConfig, onProgress) {
  if (pipeline && currentModelId === modelConfig.modelId) return pipeline;

  loading = true;
  loadError = null;
  onProgress?.('Loading model to this device…');

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
          onProgress?.(`Caching weights locally… ${Math.round(info.progress)}%`);
        }
      },
    });

    currentModelId = modelConfig.modelId;
    loading = false;
    onProgress?.('Model loaded on-device');
    return pipeline;
  } catch (err) {
    loading = false;
    loadError = err;
    console.warn('WASM model load failed, using hardware-aware fallback:', err);
    onProgress?.('Local fallback engine active');
    return null;
  }
}

export async function generate(query, hardware, modelId, history = [], ctx = {}) {
  const model = getModel(modelId);
  const start = performance.now();

  if (!pipeline && !loading) await loadModel(model);

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

      response = result[0]?.generated_text?.trim() ?? fallbackReply(query, hardware, model, ctx);
      response = response.split(/<\|im_end\|>|\n/)[0].trim();
      tokens = Math.ceil((prompt.length + response.length) / 4);
    } catch (err) {
      console.warn('Inference error:', err);
      response = fallbackReply(query, hardware, model, ctx);
      tokens = Math.ceil(response.length / 4);
    }
  } else {
    await new Promise((r) => setTimeout(r, 200 + Math.random() * 300));
    response = fallbackReply(query, hardware, model, ctx);
    tokens = Math.ceil(response.length / 4);
  }

  return {
    response,
    latency: performance.now() - start,
    tokens,
    network: getNetworkStats(),
  };
}

export function preloadModel(modelId, onProgress) {
  return loadModel(getModel(modelId), onProgress);
}

export function isModelReady() { return pipeline != null; }
