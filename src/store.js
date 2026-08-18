import { buildSeed } from './data/seed.js';

const KEY = 'forge.v1.state';

export async function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.pool && Array.isArray(parsed.problems)) return parsed;
    }
  } catch {
    /* fall through to seed */
  }
  const seeded = await buildSeed();
  saveState(seeded);
  return seeded;
}

export function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export async function resetState() {
  localStorage.removeItem(KEY);
  const seeded = await buildSeed();
  saveState(seeded);
  return seeded;
}
