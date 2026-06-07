/**
 * TouchAI Ecosystem Map — vertical + company metadata for Solutions.
 * Framed around hardware awareness, not anti-cloud positioning.
 */

export const CATEGORIES = [
  {
    id: 'foundation',
    name: 'Foundation Models & Generative AI',
    tagline: 'Any model, optimally on any device',
    touchaiRole: 'Hardware-adaptive runtime for GPT-class, Claude-class, and open models — routing inference to NPU, GPU, or CPU based on live silicon profile.',
    withoutTouchai: 'Models deploy with fixed compute assumptions — same quantisation on an M4 Ultra and a 4GB phone. No adaptation to actual silicon.',
    touchaiGain: 'Dynamic model routing, quant selection, and memory budget tuned to detected RAM, NPU, and thermal headroom in real time.',
    integrationFlow: ['Model request', 'TouchAI runtime', 'Hardware scan', 'Adaptive router', 'Situated inference'],
    metrics: { latency: '<200ms Flash', adaptation: 'Auto quant + route', models: 'Any HF / ONNX' },
    capabilities: ['Quantised inference', 'Model routing', 'Context window scaling', 'Backend selection'],
    companies: [
      { name: 'OpenAI', fit: 'Edge deployment with datacenter-grade routing logic on-device', gap: 'GPT deploys with datacenter GPU assumptions — no adaptation to the user\'s actual NPU or RAM.', touchai: 'TouchAI routes compact models to Apple Neural Engine / Hexagon NPU with dynamic token budget.' },
      { name: 'Anthropic', fit: 'Constitutional AI with hardware context in every system prompt', gap: 'Claude runs the same profile everywhere — no awareness of local compute or memory constraints.', touchai: 'Constitutional guardrails + hardware profile shape model tier, context window, and backend selection.' },
      { name: 'xAI', fit: 'Real-time inference tuned to device compute budget', gap: 'Grok assumes uniform compute — no token budget scaling for constrained devices.', touchai: 'Real-time mode adapts token budget to detected CPU core count, RAM, and thermal state.' },
      { name: 'Mistral AI', fit: 'Quantised Mistral models auto-selected by available RAM', gap: 'Mistral models sized for datacenter GPUs fail silently on phones and watches.', touchai: 'Auto-selects Mistral 7B / 3B / 0.5B based on deviceMemory and NPU availability.' },
      { name: 'Cohere', fit: 'Enterprise embeddings + generation with hardware-aware batching', gap: 'Embedding pipelines assume fixed batch sizes regardless of local memory bandwidth.', touchai: 'Embedding + RAG pipeline adapts batch size and backend to WASM, WebGPU, or native NPU.' },
      { name: 'AI21 Labs', fit: 'Jamba-class models with hardware-aware context windows', gap: 'Long-context models assume unlimited memory — crash or swap on constrained devices.', touchai: 'Context window capped dynamically to available unified memory on device.' },
      { name: 'Adept AI', fit: 'Agent actions executed with full device context', gap: 'Agents lack awareness of screen size, OS, input modality, and local compute budget.', touchai: 'Agent loop runs with device screen, OS, peripherals, and hardware budget as first-class context.' },
      { name: 'Inflection AI', fit: 'Personal AI that knows your machine, not just your words', gap: 'Personalisation ignores hardware — same experience on a phone and a workstation.', touchai: 'Session memory enriched with hardware profile; model tier adapts to detected silicon over time.' },
    ],
  },
  {
    id: 'infrastructure',
    name: 'AI Infrastructure & Data',
    tagline: 'The edge layer every stack is missing',
    touchaiRole: 'Sits below the model layer and above silicon — profiles hardware, selects backends (WASM, WebGPU, CoreML, NNAPI), and routes workloads with live telemetry.',
    withoutTouchai: 'ML pipelines treat hardware as an afterthought — same container, wrong backend assumptions for edge silicon.',
    touchaiGain: 'Hardware profile becomes first-class pipeline metadata. One runtime, any backend, adaptive at deploy time.',
    integrationFlow: ['ML pipeline', 'TouchAI profiler', 'Backend selector', 'WASM / CoreML / NNAPI', 'Device silicon'],
    metrics: { latency: 'Profile-driven', adaptation: 'Multi-backend', models: 'Any ONNX graph' },
    capabilities: ['Backend routing', 'Hardware telemetry', 'Edge feature store', 'Pipeline integration'],
    companies: [
      { name: 'Databricks', fit: 'Edge feature store + local inference for real-time ML pipelines', gap: 'Spark pipelines assume homogeneous compute — no edge hardware profiling.', touchai: 'Feature vectors computed on-device with hardware telemetry feeding back to pipeline metadata.' },
      { name: 'Scale AI', fit: 'On-device labelling with hardware telemetry validation', gap: 'Labeling quality varies by device — no runtime awareness of local compute constraints.', touchai: 'Labeling UI adapts to device capability; hardware telemetry validates annotation quality locally.' },
      { name: 'CoreWeave', fit: 'Hybrid train-cloud / infer-edge with TouchAI routing', gap: 'Training optimises for datacenter GPU — edge deployment requires manual porting.', touchai: 'Cloud train → TouchAI edge deploy. Hybrid routing splits by detected hardware capability.' },
      { name: 'Cerebras', fit: 'Wafer-scale logic extended to edge NPU orchestration', gap: 'Wafer-scale training graphs don\'t auto-partition for phone or embedded NPU tile sizes.', touchai: 'Same model graph, auto-partitioned for NPU tile size detected at runtime.' },
      { name: 'Hugging Face', fit: 'Transformers.js + TouchAI = deploy any HF model with hardware adaptation', gap: 'HF Hub download-then-run without quant selection or backend routing.', touchai: 'TouchAI wraps Transformers.js with hardware scan, quant selection, and adaptive execution.' },
    ],
  },
  {
    id: 'productivity',
    name: 'AI Search & Productivity',
    tagline: 'Search that adapts to your machine',
    touchaiRole: 'Local RAG, session memory, and retrieval tuned to device memory and compute — enterprise search that scales to available silicon.',
    withoutTouchai: 'Search AI uses fixed index sizes and rerank models — no adaptation to laptop RAM or NPU availability.',
    touchaiGain: 'Local vector index + retrieval sized to detected memory. Query latency bounded by silicon, not assumptions.',
    integrationFlow: ['User query', 'Local index', 'TouchAI RAG', 'Hardware-tuned rerank', 'Situated answer'],
    metrics: { latency: '<500ms search', adaptation: 'Memory-scaled index', models: 'Local RAG' },
    capabilities: ['Local RAG', 'Session memory', 'Citation on-device', 'Adaptive rerank'],
    companies: [
      { name: 'Perplexity AI', fit: 'On-device search index with hardware-tuned synthesis', gap: 'Search assumes server-class memory for index and reranking — degrades on constrained devices.', touchai: 'Local crawl index + LLM synthesis sized to detected RAM and GPU tier.' },
      { name: 'Glean', fit: 'Enterprise knowledge retrieval scaled to corporate device hardware', gap: 'Same search profile on a 8GB laptop and a 64GB workstation — no hardware adaptation.', touchai: 'Glean connector adapts index size and model tier to corporate laptop hardware profile.' },
      { name: 'Harvey', fit: 'Legal research with hardware-aware corpus embedding', gap: 'Legal models run with fixed context windows regardless of available unified memory.', touchai: 'Legal corpus embedded locally; model tier and context scale to detected NPU and RAM.' },
      { name: 'Writer', fit: 'Brand voice models tuned to local GPU throughput', gap: 'Generation speed fixed — no adaptation to detected GPU renderer or VRAM.', touchai: 'Fine-tuned voice model cached locally; generation speed matched to GPU capability.' },
      { name: 'Jasper', fit: 'Marketing copy with hardware-adaptive batch generation', gap: 'Batch size assumes server GPU — slow or OOM on integrated graphics.', touchai: 'Full Jasper workflow with batch size and model tier adapted to detected hardware.' },
    ],
  },
  {
    id: 'coding',
    name: 'AI Coding',
    tagline: 'IDE intelligence that knows your machine',
    touchaiRole: 'Code completion and agents that adapt to developer hardware — faster models on M-series Macs, lighter models on constrained laptops.',
    withoutTouchai: 'Coding AI uses fixed model tiers — latency scales with assumptions, not your actual M4 Mac or integrated GPU.',
    touchaiGain: 'Code index local. Completions routed by hardware profile. Latency bounded by silicon.',
    integrationFlow: ['IDE event', 'Local code index', 'TouchAI agent', 'Hardware-aware model', 'Inline completion'],
    metrics: { latency: '<100ms complete', adaptation: 'Core-scaled model', models: 'Code-specialised' },
    capabilities: ['Local codebase index', 'Agent routing', 'Memory-aware models', 'Offline capable'],
    companies: [
      { name: 'Anysphere', fit: 'Cursor-class agents with hardware-aware model selection', gap: 'Agent model tier fixed — no adaptation to developer machine RAM or NPU.', touchai: 'Cursor agent loop with TouchAI: local index + hardware-selected model tier.' },
      { name: 'Codeium', fit: 'Autocomplete latency matched to local CPU/GPU capacity', gap: 'Autocomplete model size ignores core count and memory bandwidth.', touchai: 'Sub-100ms completions via WASM model sized to detected core count and GPU.' },
      { name: 'Magic', fit: 'Long-context coding scaled to unified memory', gap: 'Long repo context assumes 80GB+ VRAM — unavailable on most developer machines.', touchai: 'Context window scales to unified memory — 16GB Mac gets 32K, 64GB gets 128K.' },
      { name: 'Poolside', fit: 'Training inference co-designed with edge deployment', gap: 'Model graph compiled for datacenter — manual port for each edge target.', touchai: 'Poolside model graph auto-compiled for detected NPU via TouchAI backend selector.' },
    ],
  },
  {
    id: 'robotics',
    name: 'Robotics & Autonomous Systems',
    tagline: 'Situated intelligence at the edge',
    touchaiRole: 'Sub-100ms inference on embedded NPUs — hardware profile drives model size, sensor fusion, and safety constraints.',
    withoutTouchai: 'Autonomous stacks assume fixed ECU compute — perception models don\'t adapt to vehicle or robot hardware profile.',
    touchaiGain: 'Hard real-time inference calibrated to embedded NPU TOPS, sensor suite, and thermal envelope.',
    integrationFlow: ['Sensor input', 'TouchAI edge node', 'NPU inference', 'Actuator command', '<100ms loop'],
    metrics: { latency: '<100ms', adaptation: 'NPU-partitioned', models: 'Embedded ONNX' },
    capabilities: ['Hard real-time', 'Safety constraints', 'Sensor fusion', 'Offline autonomy'],
    companies: [
      { name: 'Figure AI', fit: 'Humanoid control loops with on-board NPU inference', gap: 'Control models sized for assumed compute — no runtime adaptation to on-board NPU TOPS.', touchai: 'TouchAI on Figure compute module: joint control model sized to detected NPU capability.' },
      { name: 'Waymo', fit: 'Sensor fusion models sized to vehicle compute platform', gap: 'Perception models trained for datacenter GPUs don\'t auto-fit vehicle ECU.', touchai: 'Auto-partition perception graph for detected vehicle NPU (Orin, custom ASIC).' },
      { name: 'Anduril Industries', fit: 'Defence-grade edge AI with hardware attestation', gap: 'Edge AI lacks hardware-rooted trust and adaptive execution across heterogeneous nodes.', touchai: 'TouchAI runtime with hardware attestation, adaptive routing across edge nodes.' },
      { name: 'Shield AI', fit: 'Autonomous drone swarms with hardware-adaptive models', gap: 'Swarm nodes run heterogeneous hardware — no normalised inference layer.', touchai: 'TouchAI normalises inference across swarm nodes — each reports hardware profile.' },
    ],
  },
  {
    id: 'healthcare',
    name: 'Healthcare AI',
    tagline: 'Clinical AI calibrated to bedside hardware',
    touchaiRole: 'Diagnostics and pathology models that adapt to hospital workstation GPU/NPU — with full hardware telemetry for audit trails.',
    withoutTouchai: 'Clinical AI assumes hospital server GPUs — bedside workstations and lab instruments run degraded or incompatible profiles.',
    touchaiGain: 'Models adapt to hospital hardware. Full audit trail via TouchAI hardware telemetry and attestation.',
    integrationFlow: ['Clinical data', 'Hardware scan', 'TouchAI inference', 'Audit log', 'Clinical output'],
    metrics: { latency: 'Bedside-ready', adaptation: 'GPU/NPU routed', models: 'Clinical ONNX' },
    capabilities: ['Hardware attestation', 'Audit telemetry', 'Bedside adaptation', 'Regulated deploy'],
    companies: [
      { name: 'Tempus', fit: 'Clinical decision support calibrated to bedside workstation', gap: 'Genomic models assume server-class GPU — slow or unavailable at point of care.', touchai: 'Tempus models adapt to bedside workstation NPU/GPU profile with audit telemetry.' },
      { name: 'Insilico Medicine', fit: 'Drug discovery models on researcher workstations', gap: 'Molecular modelling assumes fixed GPU tier — no adaptation to lab hardware diversity.', touchai: 'Discovery pipeline adapts to researcher GPU with TouchAI hardware profiling.' },
      { name: 'PathAI', fit: 'Pathology inference on hospital hardware', gap: 'WSI inference assumes datacenter GPU — gigapixel slides overwhelm local hardware.', touchai: 'WSI inference partitioned for hospital GPU/NPU. Tile size adapts to detected VRAM.' },
      { name: 'Recursion', fit: 'Lab instrument AI with device-local compute profiling', gap: 'Microscopy pipelines don\'t adapt to instrument-embedded compute constraints.', touchai: 'Instrument-embedded TouchAI node profiles lab hardware and runs inference locally.' },
    ],
  },
  {
    id: 'creative',
    name: 'AI Video, Audio & Creative Tools',
    tagline: 'Generate at the speed of your GPU',
    touchaiRole: 'Adaptive quality — full resolution on RTX/M-series, lighter passes on integrated graphics. TouchAI reads GPU capabilities and sets generation parameters automatically.',
    withoutTouchai: 'Creative AI assumes datacenter GPUs — M-series Macs and integrated graphics get fixed degraded settings.',
    touchaiGain: 'Generation quality auto-scaled to detected GPU/VRAM. Local render matched to silicon.',
    integrationFlow: ['Creative prompt', 'GPU scan', 'Quality tier select', 'Local diffusion', 'Output file'],
    metrics: { latency: 'GPU-bound', adaptation: 'VRAM-scaled', models: 'Diffusion / TTS' },
    capabilities: ['VRAM-aware quality', 'GPU tier routing', 'Local render', 'Offline creation'],
    companies: [
      { name: 'Runway', fit: 'Video generation quality scaled to available VRAM', gap: 'Gen-3 assumes A100-class GPU — no adaptation to local Metal or CUDA tier.', touchai: 'TouchAI reads WebGL renderer → sets resolution/steps for local GPU tier.' },
      { name: 'Midjourney', fit: 'Image diffusion tuned to local GPU renderer', gap: 'Diffusion steps and resolution fixed — OOM or slow on integrated graphics.', touchai: 'SD-class model quantised to local VRAM. M-series gets Metal backend via TouchAI.' },
      { name: 'Synthesia', fit: 'Avatar rendering adapted to corporate hardware', gap: 'Avatar pipeline assumes server GPU — no adaptation to corporate workstation capability.', touchai: 'Avatar pipeline scales to corporate hardware — quality tier matched to detected GPU.' },
      { name: 'ElevenLabs', fit: 'Voice synthesis adapted to real-time CPU/GPU budget', gap: 'TTS model size fixed — breaks real-time on low-core devices.', touchai: 'TTS model sized to CPU cores. Real-time synthesis on detected hardware budget.' },
    ],
  },
];

export function getCategory(id) {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
}

export function totalCompanies() {
  return CATEGORIES.reduce((n, c) => n + c.companies.length, 0);
}

export function searchCompanies(query) {
  const q = query.toLowerCase().trim();
  if (!q) return null;
  const results = [];
  for (const cat of CATEGORIES) {
    for (const co of cat.companies) {
      if (
        co.name.toLowerCase().includes(q) ||
        co.fit.toLowerCase().includes(q) ||
        co.gap?.toLowerCase().includes(q) ||
        co.touchai?.toLowerCase().includes(q)
      ) {
        results.push({ ...co, categoryId: cat.id, categoryName: cat.name });
      }
    }
  }
  return results;
}

export function getCompany(categoryId, companyName) {
  const cat = getCategory(categoryId);
  return cat.companies.find((c) => c.name === companyName) ?? null;
}

export function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function getCompanyBySlug(categoryId, companySlug) {
  const cat = getCategory(categoryId);
  return cat.companies.find((c) => slugify(c.name) === companySlug) ?? null;
}

/** Back-compat for code still reading legacy field names */
export function companyGap(co) {
  return co.gap ?? co.problem ?? '';
}

export function categoryWithoutTouchai(cat) {
  return cat.withoutTouchai ?? cat.cloudProblem ?? '';
}
