export const MODELS = {
  flash: {
    id: 'flash',
    name: 'Flash',
    badge: 'Fastest',
    modelId: 'Xenova/Qwen2.5-0.5B-Instruct',
    speedWeight: 0.95,
    depthWeight: 0.15,
    maxTokens: 128,
    temperature: 0.6,
    description: 'Sub-200ms responses. Minimal reasoning depth.',
  },
  pulse: {
    id: 'pulse',
    name: 'Pulse',
    badge: 'Balanced',
    modelId: 'Xenova/Qwen2.5-0.5B-Instruct',
    speedWeight: 0.6,
    depthWeight: 0.5,
    maxTokens: 256,
    temperature: 0.7,
    description: 'Balanced speed and comprehension for everyday queries.',
  },
  depth: {
    id: 'depth',
    name: 'Depth',
    badge: 'Deep',
    modelId: 'Xenova/Qwen2.5-0.5B-Instruct',
    speedWeight: 0.25,
    depthWeight: 0.95,
    maxTokens: 512,
    temperature: 0.8,
    description: 'Maximum reasoning depth. Slower but thorough.',
  },
};

export const MODEL_ORDER = ['flash', 'pulse', 'depth'];

export function getModel(id) {
  return MODELS[id] ?? MODELS.flash;
}
