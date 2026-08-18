export function makeId(prefix) {
  const bytes = new Uint8Array(8);
  if (globalThis.crypto?.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${prefix}_${hex}`;
}

export function money(n) {
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
}

export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

export function weeksToMs(weeks) {
  return weeks * 7 * 24 * 60 * 60 * 1000;
}

export function msToWeeks(ms) {
  return ms / (7 * 24 * 60 * 60 * 1000);
}

export function nowIso(at = Date.now()) {
  return new Date(at).toISOString();
}
