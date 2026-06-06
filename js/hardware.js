/**
 * TouchAI Hardware Scanner
 * Detects the actual machine this runtime is executing on.
 * No simulated profiles — every spec is read from the browser APIs.
 */

function getGpuInfo() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return { renderer: 'Unknown', vendor: 'Unknown' };
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    if (!dbg) return { renderer: 'WebGL (masked)', vendor: 'Unknown' };
    return {
      renderer: gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || 'Unknown',
      vendor: gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) || 'Unknown',
    };
  } catch {
    return { renderer: 'Unavailable', vendor: 'Unknown' };
  }
}

function detectArch(ua, platform) {
  if (/arm64|aarch64/i.test(ua)) return 'arm64';
  if (/x86_64|win64|wow64|x64/i.test(ua)) return 'x86_64';
  if (/iPhone|iPad/i.test(ua)) return 'arm64';
  if (/Mac/i.test(platform)) return ua.includes('Intel') ? 'x86_64' : 'arm64';
  return platform || 'unknown';
}

function detectPlatform(ua, platform) {
  if (/iPhone/i.test(ua)) return 'iOS';
  if (/iPad/i.test(ua)) return 'iPadOS';
  if (/Android/i.test(ua)) return 'Android';
  if (/Mac/i.test(platform)) return 'macOS';
  if (/Win/i.test(platform)) return 'Windows';
  if (/Linux/i.test(platform)) return 'Linux';
  return platform || 'Unknown';
}

function inferNpu(ua, arch, platform) {
  const p = detectPlatform(ua, platform);
  if (p === 'macOS' && arch === 'arm64') return 'Apple Neural Engine · system';
  if (p === 'iOS' || p === 'iPadOS') return 'Apple Neural Engine · on-chip';
  if (/Android/i.test(ua) && /Pixel|Samsung|Galaxy/i.test(ua)) return 'Hexagon / Samsung NPU · inferred';
  if (typeof navigator.ml !== 'undefined') return 'WebNN accelerator · available';
  return 'No NPU exposed — WASM on CPU/GPU';
}

function detectFormFactor() {
  const w = window.innerWidth;
  const touch = navigator.maxTouchPoints > 0;
  if (w < 480) return touch ? 'Phone' : 'Compact';
  if (w < 900) return touch ? 'Tablet' : 'Laptop';
  if (w < 1200) return 'Desktop';
  return 'Large Display';
}

function detectWasmFeatures() {
  const features = [];
  try {
    if (typeof WebAssembly === 'object') features.push('core');
    if (WebAssembly.validate(Uint8Array.from([0, 97, 115, 109, 1, 0, 0, 0]))) features.push('validate');
    if (typeof WebAssembly.instantiateStreaming === 'function') features.push('streaming');
  } catch { /* noop */ }
  return features.join(' + ') || 'unavailable';
}

function formatRam(gb) {
  if (gb == null) return 'Not exposed by browser';
  return `${gb} GB (deviceMemory API)`;
}

function recommendModel(hardware) {
  const ram = hardware.ramGb;
  const cores = hardware.cores;
  if (ram != null && ram <= 4) return 'flash';
  if (cores != null && cores <= 4) return 'pulse';
  return 'pulse';
}

let cached = null;

export async function scanHardware() {
  if (cached) return cached;

  const ua = navigator.userAgent;
  const gpu = getGpuInfo();
  const arch = detectArch(ua, navigator.platform);
  const platform = detectPlatform(ua, navigator.platform);
  const ramGb = navigator.deviceMemory ?? null;
  const cores = navigator.hardwareConcurrency ?? null;

  cached = {
    id: 'local',
    platform,
    arch,
    cores,
    ramGb,
    ram: formatRam(ramGb),
    gpu: gpu.renderer,
    gpuVendor: gpu.vendor,
    npu: inferNpu(ua, arch, navigator.platform),
    display: `${screen.width}×${screen.height} · ${window.devicePixelRatio}x DPR`,
    viewport: `${window.innerWidth}×${window.innerHeight}`,
    formFactor: detectFormFactor(),
    touch: navigator.maxTouchPoints > 0,
    touchPoints: navigator.maxTouchPoints,
    wasm: detectWasmFeatures(),
    inferenceBackend: 'ONNX Web Runtime · WASM',
    networkPolicy: 'zero-egress',
    language: navigator.language,
    online: navigator.onLine,
    context: buildContext(platform, arch, ramGb, cores, gpu.renderer),
    recommendedModel: null,
  };

  cached.recommendedModel = recommendModel(cached);
  return cached;
}

function buildContext(platform, arch, ramGb, cores, gpu) {
  const parts = [`Running on ${platform} (${arch}).`];
  if (cores) parts.push(`${cores} CPU cores available.`);
  if (ramGb) parts.push(`${ramGb} GB addressable RAM.`);
  parts.push(`GPU: ${gpu}.`);
  parts.push('All inference stays on this machine — no cloud, no API calls.');
  return parts.join(' ');
}

export function getHardware() {
  return cached;
}

export function hardwareSummary(hw) {
  return `${hw.platform} · ${hw.arch} · ${hw.cores ?? '?'} cores · ${hw.formFactor}`;
}
