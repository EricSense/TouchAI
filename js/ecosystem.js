/**
 * TouchAI Ecosystem Map — full vertical + company metadata for Solutions.
 */

export const CATEGORIES = [
  {
    id: 'foundation',
    name: 'Foundation Models & Generative AI',
    tagline: 'Deploy any model on any device',
    touchaiRole: 'Hardware-adaptive runtime that runs GPT-class, Claude-class, and open models locally — routing inference to NPU, GPU, or CPU based on what the device actually has.',
    cloudProblem: 'Every foundation model company trains in the cloud and serves from datacenters. Users send prompts off-device and hope data stays private.',
    touchaiGain: 'Same models, routed to local NPU/GPU. Prompt never leaves silicon. Model size auto-selected by available RAM.',
    integrationFlow: ['User prompt', 'TouchAI runtime', 'Hardware scan', 'Model router', 'Local NPU/GPU inference'],
    metrics: { latency: '<200ms Flash', egress: '0 bytes', models: 'Any HF / ONNX' },
    capabilities: ['Quantised inference', 'Model routing', 'Context window scaling', 'Zero egress'],
    companies: [
      { name: 'OpenAI', fit: 'Edge deployment of compact models with datacenter-grade routing logic on-device', problem: 'GPT-4o runs in Azure — every prompt is a network round-trip.', touchai: 'TouchAI routes o3-mini-class models to Apple Neural Engine / Hexagon NPU locally.' },
      { name: 'Anthropic', fit: 'Constitutional AI runs locally — no prompt leaves the hardware', problem: 'Claude API requires sending full conversation history to Anthropic servers.', touchai: 'Constitutional guardrails run on-device; system prompt includes hardware context.' },
      { name: 'xAI', fit: 'Real-time inference tuned to device compute budget', problem: 'Grok assumes always-on cloud connectivity for low-latency replies.', touchai: 'Real-time mode adapts token budget to detected CPU core count and RAM.' },
      { name: 'Mistral AI', fit: 'Quantised Mistral models auto-selected by available RAM', problem: 'Mistral models sized for datacenter GPUs fail on phones and watches.', touchai: 'Auto-selects Mistral 7B / 3B / 0.5B based on deviceMemory API reading.' },
      { name: 'Cohere', fit: 'Enterprise embeddings + generation at the edge', problem: 'Embed API sends documents to Cohere cloud for vectorisation.', touchai: 'Embedding + RAG pipeline runs entirely in browser WASM or native NPU.' },
      { name: 'AI21 Labs', fit: 'Jamba-class models with hardware-aware context windows', problem: 'Long-context models assume unlimited datacenter memory.', touchai: 'Context window capped dynamically to available unified memory on device.' },
      { name: 'Adept AI', fit: 'Agent actions executed locally with device context', problem: 'Agents call cloud APIs for every UI action and tool invocation.', touchai: 'Agent loop runs locally with device screen size, OS, and input modality context.' },
      { name: 'Inflection AI', fit: 'Personal AI that knows your machine, not just your words', problem: 'Pi personalisation lives in Inflection\'s cloud memory store.', touchai: 'Session memory stays in local IndexedDB — hardware profile enriches every turn.' },
    ],
  },
  {
    id: 'infrastructure',
    name: 'AI Infrastructure & Data',
    tagline: 'The edge layer every stack is missing',
    touchaiRole: 'Sits below the model layer and above silicon — profiles hardware, selects backends (WASM, WebGPU, CoreML, NNAPI), and routes workloads without a datacenter hop.',
    cloudProblem: 'Infrastructure companies optimise for datacenter throughput. Edge deployment is an afterthought — same Docker container, wrong hardware assumptions.',
    touchaiGain: 'Hardware profile becomes first-class metadata in the ML pipeline. One runtime, any backend.',
    integrationFlow: ['ML pipeline', 'TouchAI profiler', 'Backend selector', 'WASM / CoreML / NNAPI', 'Device silicon'],
    metrics: { latency: 'Profile-driven', egress: '0 bytes', models: 'Multi-backend' },
    capabilities: ['Backend routing', 'Hardware telemetry', 'Edge feature store', 'Pipeline integration'],
    companies: [
      { name: 'Databricks', fit: 'Edge feature store + local inference for real-time ML pipelines', problem: 'Spark pipelines assume data lives in cloud lakehouse.', touchai: 'Feature vectors computed on-device feed back to pipeline without raw data egress.' },
      { name: 'Scale AI', fit: 'On-device labelling and validation with hardware telemetry', problem: 'Human labelers work in cloud tools; edge data must upload first.', touchai: 'Labeling UI runs locally; hardware telemetry validates annotation quality on-device.' },
      { name: 'CoreWeave', fit: 'Complement cloud GPU with device-side inference offload', problem: '100% cloud GPU creates latency and cost at inference time.', touchai: 'Cloud train → TouchAI edge deploy. Hybrid routing splits by hardware capability.' },
      { name: 'Cerebras', fit: 'Wafer-scale logic extended to edge NPU orchestration', problem: 'Wafer-scale training doesn\'t translate to phone/watch deployment.', touchai: 'Same model graph, auto-partitioned for NPU tile size detected at runtime.' },
      { name: 'Hugging Face', fit: 'Transformers.js + TouchAI runtime = deploy any HF model on-device', problem: 'HF Hub assumes download-then-run without hardware adaptation.', touchai: 'TouchAI wraps Transformers.js with hardware scan, quant selection, and zero-egress policy.' },
    ],
  },
  {
    id: 'productivity',
    name: 'AI Search & Productivity',
    tagline: 'Private search that never phones home',
    touchaiRole: 'Local RAG, session memory, and retrieval run entirely on the user\'s hardware — enterprise search without sending queries to Perplexity\'s servers.',
    cloudProblem: 'Search AI sends every query + document context to cloud indexes. Enterprise data crosses the network on every keystroke.',
    touchaiGain: 'Local vector index + retrieval. Query and documents never leave the machine.',
    integrationFlow: ['User query', 'Local index', 'TouchAI RAG', 'Hardware-tuned rerank', 'Answer on-device'],
    metrics: { latency: '<500ms search', egress: '0 bytes', models: 'Local RAG' },
    capabilities: ['Local RAG', 'Session memory', 'Citation on-device', 'Air-gapped mode'],
    companies: [
      { name: 'Perplexity AI', fit: 'On-device search index + citation without network round-trip', problem: 'Every search query hits Perplexity servers with full browser context.', touchai: 'Local crawl index + LLM synthesis. Citations from on-device cache.' },
      { name: 'Glean', fit: 'Enterprise knowledge retrieval stays inside the corporate device', problem: 'Enterprise docs indexed in Glean cloud — queries expose internal IP.', touchai: 'Glean connector runs local index sync; search inference stays on corporate laptop.' },
      { name: 'Harvey', fit: 'Legal research on-device — privileged data never egresses', problem: 'Attorney-client privileged docs sent to Harvey cloud for analysis.', touchai: 'Legal corpus embedded locally. Harvey-class reasoning on device NPU only.' },
      { name: 'Writer', fit: 'Brand voice models tuned to local GPU throughput', problem: 'Brand voice API calls require sending draft copy to Writer servers.', touchai: 'Fine-tuned voice model cached locally; generation speed matched to GPU.' },
      { name: 'Jasper', fit: 'Marketing copy generated on-device for air-gapped teams', problem: 'Marketing teams in regulated industries cannot use cloud copy tools.', touchai: 'Full Jasper workflow in air-gapped mode with hardware-adaptive batch size.' },
    ],
  },
  {
    id: 'coding',
    name: 'AI Coding',
    tagline: 'IDE intelligence that knows your machine',
    touchaiRole: 'Code completion and agents that adapt to developer hardware — faster models on M-series Macs, lighter models on constrained laptops.',
    cloudProblem: 'Coding AI sends your entire codebase context to cloud on every completion. Latency scales with network, not your M4 Mac.',
    touchaiGain: 'Code index local. Completions routed to NPU/GPU. Latency bounded by silicon, not RTT.',
    integrationFlow: ['IDE event', 'Local code index', 'TouchAI agent', 'Hardware-aware model', 'Inline completion'],
    metrics: { latency: '<100ms complete', egress: '0 bytes', models: 'Code-specialised' },
    capabilities: ['Local codebase index', 'Agent routing', 'Memory-aware models', 'Offline mode'],
    companies: [
      { name: 'Anysphere', fit: 'Cursor-class agents with hardware-aware model selection', problem: 'Cursor sends file context to cloud models on every agent turn.', touchai: 'Cursor agent loop with TouchAI: local index + hardware-selected model tier.' },
      { name: 'Codeium', fit: 'Autocomplete latency matched to local CPU/GPU capacity', problem: 'Autocomplete waits for cloud round-trip — feels laggy on slow networks.', touchai: 'Sub-100ms completions via local WASM model sized to detected core count.' },
      { name: 'Magic', fit: 'Long-context coding on devices with sufficient unified memory', problem: 'Long repo context requires cloud GPUs with 80GB+ VRAM.', touchai: 'Context window scales to unified memory — 16GB Mac gets 32K, 64GB gets 128K.' },
      { name: 'Poolside', fit: 'Training inference co-designed with edge deployment', problem: 'Training infra optimised for datacenter; edge deployment is manual port.', touchai: 'Poolside model graph auto-compiled for detected NPU via TouchAI backend selector.' },
    ],
  },
  {
    id: 'robotics',
    name: 'Robotics & Autonomous Systems',
    tagline: 'Real-time intelligence at the edge',
    touchaiRole: 'Sub-100ms inference on embedded NPUs in robots, drones, and autonomous vehicles — hardware profile drives model size and safety constraints.',
    cloudProblem: 'Autonomous systems cannot rely on cloud inference — 200ms network latency is fatal at 60mph. Yet most AI stacks assume connectivity.',
    touchaiGain: 'Hard real-time inference on embedded NPU. Safety constraints encoded in hardware profile.',
    integrationFlow: ['Sensor input', 'TouchAI edge node', 'NPU inference', 'Actuator command', '<100ms loop'],
    metrics: { latency: '<100ms', egress: '0 bytes', models: 'Embedded ONNX' },
    capabilities: ['Hard real-time', 'Safety constraints', 'Sensor fusion', 'Offline autonomy'],
    companies: [
      { name: 'Figure AI', fit: 'Humanoid control loops with on-board NPU inference', problem: 'Humanoid balance requires sub-50ms control — cloud is impossible.', touchai: 'TouchAI on Figure compute module: joint control model sized to on-board NPU TOPS.' },
      { name: 'Waymo', fit: 'Sensor fusion models sized to vehicle compute platform', problem: 'Perception models trained for datacenter GPUs don\'t fit in vehicle ECU.', touchai: 'Auto-partition perception graph for detected vehicle NPU (Orin, custom ASIC).' },
      { name: 'Anduril Industries', fit: 'Defence-grade edge AI with zero cloud dependency', problem: 'Battlefield environments have no reliable cloud connectivity.', touchai: 'Fully air-gapped TouchAI runtime with hardware attestation and zero egress policy.' },
      { name: 'Shield AI', fit: 'Autonomous drone swarms with hardware-adaptive models', problem: 'Drone swarms need consistent inference across heterogeneous hardware.', touchai: 'TouchAI normalises inference across swarm nodes — each reports hardware profile.' },
    ],
  },
  {
    id: 'healthcare',
    name: 'Healthcare AI',
    tagline: 'Patient data never leaves the device',
    touchaiRole: 'HIPAA-aligned on-device inference — diagnostics, pathology, and drug discovery models run locally with full hardware telemetry for audit trails.',
    cloudProblem: 'PHI sent to cloud AI violates HIPAA without BAA. Hospitals need on-premise inference but lack a unified runtime.',
    touchaiGain: 'PHI stays on hospital hardware. Full audit trail via TouchAI hardware telemetry.',
    integrationFlow: ['Patient data', 'Local de-ID', 'TouchAI inference', 'Audit log', 'Clinical output'],
    metrics: { latency: 'Bedside-ready', egress: '0 PHI bytes', models: 'Clinical ONNX' },
    capabilities: ['HIPAA-aligned', 'Audit telemetry', 'Air-gapped clinical', 'PHI zero egress'],
    companies: [
      { name: 'Tempus', fit: 'Clinical decision support at bedside without cloud PHI transfer', problem: 'Genomic + clinical data sent to Tempus cloud for AI analysis.', touchai: 'Tempus models run on bedside workstation — PHI never crosses network.' },
      { name: 'Insilico Medicine', fit: 'Drug discovery models on researcher workstations', problem: 'Proprietary compound data uploaded to cloud for molecular modelling.', touchai: 'Discovery pipeline on researcher GPU with TouchAI hardware profiling.' },
      { name: 'PathAI', fit: 'Pathology inference on hospital hardware, not remote servers', problem: 'Whole-slide images (WSI) uploaded to PathAI cloud — gigabytes of PHI.', touchai: 'WSI inference on hospital GPU/NPU. Slides never leave pathology lab network.' },
      { name: 'Recursion', fit: 'Lab instrument AI with device-local compute profiling', problem: 'Microscopy data streamed to cloud for phenomics analysis.', touchai: 'Instrument-embedded TouchAI node profiles lab hardware and runs inference locally.' },
    ],
  },
  {
    id: 'creative',
    name: 'AI Video, Audio & Creative Tools',
    tagline: 'Generate at the speed of your GPU',
    touchaiRole: 'Adaptive quality — full resolution on RTX/M-series, lighter passes on integrated graphics. TouchAI reads GPU capabilities and sets generation parameters automatically.',
    cloudProblem: 'Creative AI assumes datacenter GPUs. Users with M-series Macs or integrated graphics get cloud-only workflows or degraded queue times.',
    touchaiGain: 'Generation quality auto-scaled to detected GPU/VRAM. Local render, no upload.',
    integrationFlow: ['Creative prompt', 'GPU scan', 'Quality tier select', 'Local diffusion', 'Output file'],
    metrics: { latency: 'GPU-bound', egress: '0 bytes', models: 'Diffusion / TTS' },
    capabilities: ['VRAM-aware quality', 'GPU tier routing', 'Local render', 'Offline creation'],
    companies: [
      { name: 'Runway', fit: 'Video generation quality scaled to available VRAM', problem: 'Gen-3 assumes A100-class GPU in cloud queue.', touchai: 'TouchAI reads WebGL renderer → sets resolution/steps for local GPU tier.' },
      { name: 'Midjourney', fit: 'Image diffusion tuned to local GPU renderer', problem: 'Discord-bot model runs only on Midjourney servers.', touchai: 'SD-class model quantised to local VRAM. M-series gets Metal backend via TouchAI.' },
      { name: 'Synthesia', fit: 'Avatar rendering on-device for enterprise privacy', problem: 'Employee training videos require uploading face/voice to Synthesia cloud.', touchai: 'Avatar pipeline on corporate hardware — face data never egresses.' },
      { name: 'ElevenLabs', fit: 'Voice synthesis adapted to real-time CPU/GPU budget', problem: 'Voice cloning requires cloud API; latency breaks real-time dubbing.', touchai: 'TTS model sized to CPU cores. Real-time synthesis on detected hardware budget.' },
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
        co.problem?.toLowerCase().includes(q) ||
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
