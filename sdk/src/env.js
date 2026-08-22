/**
 * Runtime environment — TouchAI runs anywhere JS runs.
 */

export function isBrowser() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

export function isNode() {
  return typeof process !== 'undefined' && Boolean(process.versions?.node);
}

export function runtimeId() {
  if (isBrowser()) return 'browser';
  if (isNode()) return 'node';
  return 'unknown';
}

/** Storage that works in browser (localStorage) or Node (memory). */
const mem = new Map();

export const storage = {
  getItem(key) {
    if (isBrowser()) {
      try { return localStorage.getItem(key); } catch { return null; }
    }
    return mem.has(key) ? mem.get(key) : null;
  },
  setItem(key, value) {
    if (isBrowser()) {
      try { localStorage.setItem(key, value); } catch { /* quota */ }
      return;
    }
    mem.set(key, value);
  },
  removeItem(key) {
    if (isBrowser()) {
      try { localStorage.removeItem(key); } catch { /* ignore */ }
      return;
    }
    mem.delete(key);
  },
};
