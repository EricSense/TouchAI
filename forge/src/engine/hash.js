/** Canonical JSON + SHA-256. Works in Node 20+ and the browser. */

export function canonical(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonical(value[k])}`).join(',')}}`;
}

export async function sha256Hex(input) {
  const data = typeof input === 'string' ? new TextEncoder().encode(input) : input;
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error('SHA-256 is unavailable in this runtime');
  }
  const buf = await subtle.digest('SHA-256', data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function digestPayload(payload) {
  return sha256Hex(canonical(payload));
}
