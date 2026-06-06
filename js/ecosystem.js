/**
 * TouchAI Ecosystem Map
 * How the hardware-aware runtime applies across the AI landscape.
 */

export const CATEGORIES = [
  {
    id: 'foundation',
    name: 'Foundation Models & Generative AI',
    tagline: 'Deploy any model on any device',
    touchaiRole: 'Hardware-adaptive runtime that runs GPT-class, Claude-class, and open models locally — routing inference to NPU, GPU, or CPU based on what the device actually has.',
    companies: [
      { name: 'OpenAI', fit: 'Edge deployment of compact models with datacenter-grade routing logic on-device' },
      { name: 'Anthropic', fit: 'Constitutional AI runs locally — no prompt leaves the hardware' },
      { name: 'xAI', fit: 'Real-time inference tuned to device compute budget' },
      { name: 'Mistral AI', fit: 'Quantised Mistral models auto-selected by available RAM' },
      { name: 'Cohere', fit: 'Enterprise embeddings + generation at the edge' },
      { name: 'AI21 Labs', fit: 'Jamba-class models with hardware-aware context windows' },
      { name: 'Adept AI', fit: 'Agent actions executed locally with device context' },
      { name: 'Inflection AI', fit: 'Personal AI that knows your machine, not just your words' },
    ],
  },
  {
    id: 'infrastructure',
    name: 'AI Infrastructure & Data',
    tagline: 'The edge layer every stack is missing',
    touchaiRole: 'Sits below the model layer and above silicon — profiles hardware, selects backends (WASM, WebGPU, CoreML, NNAPI), and routes workloads without a datacenter hop.',
    companies: [
      { name: 'Databricks', fit: 'Edge feature store + local inference for real-time ML pipelines' },
      { name: 'Scale AI', fit: 'On-device labelling and validation with hardware telemetry' },
      { name: 'CoreWeave', fit: 'Complement cloud GPU with device-side inference offload' },
      { name: 'Cerebras', fit: 'Wafer-scale logic extended to edge NPU orchestration' },
      { name: 'Hugging Face', fit: 'Transformers.js + TouchAI runtime = deploy any HF model on-device' },
    ],
  },
  {
    id: 'productivity',
    name: 'AI Search & Productivity',
    tagline: 'Private search that never phones home',
    touchaiRole: 'Local RAG, session memory, and retrieval run entirely on the user\'s hardware — enterprise search without sending queries to Perplexity\'s servers.',
    companies: [
      { name: 'Perplexity AI', fit: 'On-device search index + citation without network round-trip' },
      { name: 'Glean', fit: 'Enterprise knowledge retrieval stays inside the corporate device' },
      { name: 'Harvey', fit: 'Legal research on-device — privileged data never egresses' },
      { name: 'Writer', fit: 'Brand voice models tuned to local GPU throughput' },
      { name: 'Jasper', fit: 'Marketing copy generated on-device for air-gapped teams' },
    ],
  },
  {
    id: 'coding',
    name: 'AI Coding',
    tagline: 'IDE intelligence that knows your machine',
    touchaiRole: 'Code completion and agents that adapt to developer hardware — faster models on M-series Macs, lighter models on constrained laptops.',
    companies: [
      { name: 'Anysphere', fit: 'Cursor-class agents with hardware-aware model selection' },
      { name: 'Codeium', fit: 'Autocomplete latency matched to local CPU/GPU capacity' },
      { name: 'Magic', fit: 'Long-context coding on devices with sufficient unified memory' },
      { name: 'Poolside', fit: 'Training inference co-designed with edge deployment' },
    ],
  },
  {
    id: 'robotics',
    name: 'Robotics & Autonomous Systems',
    tagline: 'Real-time intelligence at the edge',
    touchaiRole: 'Sub-100ms inference on embedded NPUs in robots, drones, and autonomous vehicles — hardware profile drives model size and safety constraints.',
    companies: [
      { name: 'Figure AI', fit: 'Humanoid control loops with on-board NPU inference' },
      { name: 'Waymo', fit: 'Sensor fusion models sized to vehicle compute platform' },
      { name: 'Anduril Industries', fit: 'Defence-grade edge AI with zero cloud dependency' },
      { name: 'Shield AI', fit: 'Autonomous drone swarms with hardware-adaptive models' },
    ],
  },
  {
    id: 'healthcare',
    name: 'Healthcare AI',
    tagline: 'Patient data never leaves the device',
    touchaiRole: 'HIPAA-aligned on-device inference — diagnostics, pathology, and drug discovery models run locally with full hardware telemetry for audit trails.',
    companies: [
      { name: 'Tempus', fit: 'Clinical decision support at bedside without cloud PHI transfer' },
      { name: 'Insilico Medicine', fit: 'Drug discovery models on researcher workstations' },
      { name: 'PathAI', fit: 'Pathology inference on hospital hardware, not remote servers' },
      { name: 'Recursion', fit: 'Lab instrument AI with device-local compute profiling' },
    ],
  },
  {
    id: 'creative',
    name: 'AI Video, Audio & Creative Tools',
    tagline: 'Generate at the speed of your GPU',
    touchaiRole: 'Adaptive quality — full resolution on RTX/M-series, lighter passes on integrated graphics. TouchAI reads GPU capabilities and sets generation parameters automatically.',
    companies: [
      { name: 'Runway', fit: 'Video generation quality scaled to available VRAM' },
      { name: 'Midjourney', fit: 'Image diffusion tuned to local GPU renderer' },
      { name: 'Synthesia', fit: 'Avatar rendering on-device for enterprise privacy' },
      { name: 'ElevenLabs', fit: 'Voice synthesis adapted to real-time CPU/GPU budget' },
    ],
  },
];

export function getCategory(id) {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
}

export function totalCompanies() {
  return CATEGORIES.reduce((n, c) => n + c.companies.length, 0);
}

export function allCompanyNames() {
  return CATEGORIES.flatMap((c) => c.companies.map((co) => co.name));
}
