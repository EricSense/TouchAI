/**
 * TouchAI Hardware Scanner — 8-layer awareness.
 * Works in the browser and on Node hosts (deploy anywhere).
 */

import {
  scanPower, scanSensors, scanPeripherals, scanThermal,
  scanMemoryDetail, scanUserPatterns, scanHistoryLayer, getAwarenessHistory,
} from './awareness.js';
import { HARDWARE_LAYERS } from './layers.js';
import { isBrowser, isNode } from './env.js';

function getGpuInfo() {
  if (!isBrowser()) {
    return { renderer: isNode() ? 'Node host · no WebGL' : 'Unavailable', vendor: 'n/a' };
  }
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
  if (p === 'macOS' && arch === 'arm64') return 'Apple Neural Engine · active';
  if (p === 'iOS' || p === 'iPadOS') return 'Apple Neural Engine · on-chip';
  if (/Android/i.test(ua) && /Pixel|Samsung|Galaxy/i.test(ua)) return 'Hexagon / Samsung NPU · detected';
  if (typeof navigator !== 'undefined' && typeof navigator.ml !== 'undefined') return 'WebNN accelerator · available';
  return 'WASM compute path · CPU/GPU';
}

function detectFormFactor() {
  if (!isBrowser()) return 'Server';
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
    if (typeof WebAssembly !== 'undefined' && WebAssembly.validate?.(Uint8Array.from([0, 97, 115, 109, 1, 0, 0, 0]))) {
      features.push('validate');
    }
    if (typeof WebAssembly !== 'undefined' && typeof WebAssembly.instantiateStreaming === 'function') {
      features.push('streaming');
    }
  } catch { /* noop */ }
  return features.join(' + ') || 'unavailable';
}

function formatRam(gb) {
  if (gb == null) return 'RAM not exposed';
  return `${gb} GB`;
}

function recommendModel(hardware) {
  const ram = hardware.ramGb;
  const cores = hardware.cores;
  if (ram != null && ram <= 4) return 'flash';
  if (cores != null && cores <= 4) return 'pulse';
  return 'pulse';
}

function buildSiliconLayer(platform, arch, cores, gpu, npu, wasm) {
  return {
    platform,
    arch,
    cores: cores != null ? `${cores} cores` : 'not exposed',
    gpu: gpu.renderer,
    npu,
    isa: arch === 'arm64' ? 'ARM64 · NEON' : 'x86_64 · SIMD',
    wasm,
  };
}

function buildContext(hw) {
  const a = hw.awareness;
  return [
    `Running on ${hw.platform} (${hw.arch}).`,
    `${a.silicon.cores}. GPU: ${a.silicon.gpu}.`,
    `Thermal: ${a.thermal.state} · ${a.thermal.headroom}.`,
    `Power: ${a.power.level} · ${a.power.budget}.`,
    `Sensors: ${a.sensors.active}.`,
    `User rhythm: ${a.user.rhythm}.`,
    'TouchAI situates inference with all 8 awareness layers — deploy anywhere, anytime.',
  ].join(' ');
}

async function scanNodeHost() {
  try {
    // Opaque import so Vite never pulls node:os into the browser bundle
    const loadOs = new Function('return import("node:os")');
    const os = await loadOs();
    const total = os.totalmem();
    const free = os.freemem();
    const cpus = os.cpus() || [];
    return {
      platform: os.platform(),
      arch: os.arch(),
      cores: cpus.length || 1,
      ramGb: +(total / 1024 ** 3).toFixed(2),
      freeGb: +(free / 1024 ** 3).toFixed(2),
      gpu: { renderer: 'Node host · no WebGL', vendor: 'n/a' },
      ua: `node/${process.version}`,
      navPlatform: os.platform(),
      hostname: os.hostname(),
      uptimeSec: Math.round(os.uptime()),
      load: typeof os.loadavg === 'function' ? os.loadavg().map((n) => +n.toFixed(2)) : [0, 0, 0],
    };
  } catch {
    return {
      platform: 'node',
      arch: 'unknown',
      cores: 1,
      ramGb: 1,
      freeGb: 0,
      gpu: { renderer: 'Unavailable', vendor: 'Unknown' },
      ua: '',
      navPlatform: 'node',
    };
  }
}

async function scanBrowserHost() {
  const ua = navigator.userAgent;
  const gpu = getGpuInfo();
  const arch = detectArch(ua, navigator.platform);
  const platform = detectPlatform(ua, navigator.platform);
  const ramGb = navigator.deviceMemory ?? null;
  const cores = navigator.hardwareConcurrency ?? null;
  return { platform, arch, cores, ramGb, freeGb: null, gpu, ua, navPlatform: navigator.platform };
}

let cached = null;

export async function scanHardware(force = false) {
  if (cached && !force) return cached;

  const host = isBrowser()
    ? await scanBrowserHost()
    : isNode()
      ? await scanNodeHost()
      : {
          platform: 'Unknown',
          arch: 'unknown',
          cores: null,
          ramGb: null,
          freeGb: null,
          gpu: { renderer: 'Unavailable', vendor: 'Unknown' },
          ua: '',
          navPlatform: 'unknown',
        };

  const { platform, arch, cores, ramGb, freeGb, gpu, ua, navPlatform } = host;
  const summary = `${platform} · ${arch} · ${cores ?? '?'} cores`;

  const [power, sensors] = await Promise.all([scanPower(), scanSensors()]);
  const thermal = scanThermal(cores, ramGb);
  const memory = scanMemoryDetail(ramGb);
  if (freeGb != null) memory.heap = `${freeGb} GB free`;
  const peripherals = scanPeripherals();
  const store = getAwarenessHistory();
  const history = scanHistoryLayer(store, summary);
  const user = scanUserPatterns(getAwarenessHistory());

  const silicon = buildSiliconLayer(
    platform,
    arch,
    cores,
    gpu,
    inferNpu(ua, arch, navPlatform),
    detectWasmFeatures(),
  );

  const awareness = { silicon, thermal, power, memory, sensors, peripherals, history, user };

  cached = {
    id: 'local',
    runtime: isBrowser() ? 'browser' : isNode() ? 'node' : 'unknown',
    platform,
    arch,
    cores,
    ramGb,
    ram: formatRam(ramGb),
    gpu: gpu.renderer,
    gpuVendor: gpu.vendor,
    npu: silicon.npu,
    display: isBrowser()
      ? `${screen.width}×${screen.height} · ${window.devicePixelRatio}x DPR`
      : 'headless',
    viewport: isBrowser() ? `${window.innerWidth}×${window.innerHeight}` : 'n/a',
    formFactor: detectFormFactor(),
    touch: isBrowser() ? navigator.maxTouchPoints > 0 : false,
    touchPoints: isBrowser() ? navigator.maxTouchPoints : 0,
    wasm: silicon.wasm,
    inferenceBackend: 'TouchAI Runtime · adaptive',
    networkPolicy: 'hardware-adaptive',
    language: isBrowser() ? navigator.language : (process.env.LANG ?? 'en'),
    online: isBrowser() ? navigator.onLine : true,
    awareness,
    layers: HARDWARE_LAYERS.map((l) => ({
      name: l.layer,
      summary: layerSummary(l.layer, awareness),
    })),
    layersActive: 8,
    layersTotal: 8,
    recommendedModel: null,
    context: '',
  };

  cached.recommendedModel = recommendModel(cached);
  cached.context = buildContext(cached);
  return cached;
}

function layerSummary(layerName, a) {
  switch (layerName) {
    case 'Silicon': return `${a.silicon.platform} · ${a.silicon.arch} · ${a.silicon.cores}`;
    case 'Thermal': return `${a.thermal.state} · ${a.thermal.headroom}`;
    case 'Power': return `${a.power.level} · ${a.power.budget}`;
    case 'Memory': return `${a.memory.ram} · ${a.memory.heap ?? a.memory.bandwidth}`;
    case 'Sensors': return a.sensors.active;
    case 'Peripherals': return a.peripherals.connected;
    case 'History': return `${a.history.scans} scans · ${a.history.avgLatency}`;
    case 'User': return `${a.user.rhythm} · ${a.user.signature}`;
    default: return 'active';
  }
}

export function getHardware() {
  return cached;
}

export function hardwareSummary(hw) {
  return `${hw.platform} · ${hw.arch} · ${hw.cores ?? '?'} cores · ${hw.layersActive}/${hw.layersTotal} layers`;
}

export function formatAwarenessLayer(hw, layerName) {
  const a = hw?.awareness;
  if (!a) return '—';
  return layerSummary(layerName, a);
}
