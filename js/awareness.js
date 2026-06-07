/**
 * TouchAI awareness persistence — History & User layers across sessions.
 */

const KEY = 'touchai-awareness';

function loadStore() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? {};
  } catch {
    return {};
  }
}

function saveStore(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function recordScan(hwSummary) {
  const store = loadStore();
  const now = Date.now();
  store.scanCount = (store.scanCount ?? 0) + 1;
  store.lastScan = now;
  store.lastProfile = hwSummary;
  store.sessions = store.sessions ?? [];
  if (!store.sessions.length || now - store.sessions[store.sessions.length - 1].start > 30 * 60 * 1000) {
    store.sessions.push({ start: now, queries: 0 });
  }
  if (store.sessions.length > 20) store.sessions = store.sessions.slice(-20);
  saveStore(store);
  return store;
}

export function recordQuery(latencyMs, modelId) {
  const store = loadStore();
  store.totalQueries = (store.totalQueries ?? 0) + 1;
  store.latencies = store.latencies ?? [];
  store.latencies.push(latencyMs);
  if (store.latencies.length > 50) store.latencies = store.latencies.slice(-50);
  store.avgLatency = store.latencies.reduce((a, b) => a + b, 0) / store.latencies.length;
  store.preferredModel = modelId;
  const session = store.sessions?.[store.sessions.length - 1];
  if (session) session.queries = (session.queries ?? 0) + 1;
  saveStore(store);
}

export function getAwarenessHistory() {
  return loadStore();
}

export async function scanPower() {
  if (!navigator.getBattery) {
    return { source: 'desktop · plugged', level: '100%', charging: true, budget: 'unlimited' };
  }
  try {
    const bat = await navigator.getBattery();
    const pct = Math.round(bat.level * 100);
    const budget = bat.charging ? 'charging · full performance' : pct > 50 ? 'balanced' : pct > 20 ? 'power-save aware' : 'critical · throttling';
    return {
      source: 'Battery Status API',
      level: `${pct}%`,
      charging: bat.charging,
      budget,
    };
  } catch {
    return { source: 'unavailable', level: 'unknown', charging: null, budget: 'unknown' };
  }
}

export async function scanSensors() {
  const sensors = [];
  let cameras = 0;
  let mics = 0;

  if (navigator.mediaDevices?.enumerateDevices) {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      for (const d of devices) {
        if (d.kind === 'videoinput') cameras++;
        if (d.kind === 'audioinput') mics++;
      }
    } catch { /* permission not required for counts on some browsers */ }
  }

  if (cameras) sensors.push(`${cameras} camera${cameras > 1 ? 's' : ''}`);
  if (mics) sensors.push(`${mics} mic${mics > 1 ? 's' : ''}`);
  if ('geolocation' in navigator) sensors.push('GPS');
  if (window.DeviceOrientationEvent) sensors.push('orientation');
  if (window.DeviceMotionEvent) sensors.push('accelerometer');
  if (typeof Accelerometer !== 'undefined') sensors.push('motion · Generic Sensor');
  if (typeof AmbientLightSensor !== 'undefined') sensors.push('ambient light');

  return {
    active: sensors.length ? sensors.join(' · ') : 'touch · pointer · keyboard',
    cameras,
    mics,
    count: sensors.length || 3,
  };
}

export function scanPeripherals() {
  const connected = [];
  const available = [];

  if (navigator.getGamepads) {
    const pads = [...navigator.getGamepads()].filter(Boolean);
    if (pads.length) connected.push(`${pads.length} gamepad${pads.length > 1 ? 's' : ''}`);
  }
  if ('usb' in navigator) available.push('USB');
  if ('hid' in navigator) available.push('HID');
  if ('bluetooth' in navigator) available.push('Bluetooth');
  if ('serial' in navigator) available.push('Serial');

  return {
    connected: connected.length ? connected.join(' · ') : 'none detected',
    available: available.length ? available.join(' · ') : 'standard I/O',
  };
}

export function scanThermal(cores, ramGb) {
  let heapPressure = null;
  if (performance.memory) {
    const m = performance.memory;
    heapPressure = m.usedJSHeapSize / m.jsHeapSizeLimit;
  }

  const conn = navigator.connection ?? navigator.mozConnection ?? navigator.webkitConnection;
  let state = 'nominal';
  let headroom = 'high';

  if (heapPressure != null) {
    if (heapPressure > 0.85) { state = 'elevated load'; headroom = 'low'; }
    else if (heapPressure > 0.6) { state = 'warm'; headroom = 'moderate'; }
    else headroom = `${Math.round((1 - heapPressure) * 100)}% headroom`;
  }

  if (conn?.saveData) { state = 'data-saver · conservative'; headroom = 'moderate'; }
  if (cores != null && cores <= 4) headroom = headroom === 'high' ? 'moderate' : headroom;

  return {
    state,
    headroom,
    throttleRisk: heapPressure != null && heapPressure > 0.8 ? 'elevated' : 'low',
    source: performance.memory ? 'heap + connection telemetry' : 'platform inference',
  };
}

export function scanMemoryDetail(ramGb) {
  const detail = { ram: ramGb != null ? `${ramGb} GB addressable` : 'browser-limited visibility' };

  if (performance.memory) {
    const m = performance.memory;
    detail.heap = `${Math.round(m.usedJSHeapSize / 1048576)} / ${Math.round(m.jsHeapSizeLimit / 1048576)} MB heap`;
    detail.bandwidth = m.jsHeapSizeLimit > 2147483648 ? 'high · unified memory path' : 'standard';
  } else {
    detail.bandwidth = ramGb != null && ramGb >= 16 ? 'high · inferred from deviceMemory' : 'standard';
  }

  return detail;
}

export function scanUserPatterns(store) {
  const hour = new Date().getHours();
  let rhythm = 'active session';
  if (hour >= 6 && hour < 12) rhythm = 'morning workload';
  else if (hour >= 12 && hour < 17) rhythm = 'midday compute';
  else if (hour >= 17 && hour < 22) rhythm = 'evening peak · GPU-heavy window';
  else rhythm = 'off-peak · low contention';

  const sessions = store.sessions?.length ?? 0;
  const queries = store.totalQueries ?? 0;
  const scans = store.scanCount ?? 1;

  return {
    rhythm,
    signature: queries > 0 ? `${queries} queries · ${scans} scans` : `${scans} scan${scans === 1 ? '' : 's'} · new session`,
    sessions,
    avgLatency: store.avgLatency ? `${Math.round(store.avgLatency)}ms avg` : 'building fingerprint',
  };
}

export function scanHistoryLayer(store, hwSummary) {
  recordScan(hwSummary);
  const updated = loadStore();
  return {
    scans: updated.scanCount ?? 1,
    lastScan: updated.lastScan ? new Date(updated.lastScan).toLocaleString() : 'now',
    fingerprint: updated.lastProfile ?? hwSummary,
    avgLatency: updated.avgLatency ? `${Math.round(updated.avgLatency)}ms` : 'collecting',
    sessions: updated.sessions?.length ?? 1,
  };
}
