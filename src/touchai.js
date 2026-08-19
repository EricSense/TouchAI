/**
 * TouchAI — Touch-Aware AI
 * Awareness of contact: where, how hard, how it moves, what it means.
 */

export const VERSION = '1.0.0';
export const PRODUCT = 'TouchAI';
export const CATEGORY = 'Touch-Aware AI';

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function hypot(dx, dy) {
  return Math.sqrt(dx * dx + dy * dy);
}

function zoneOf(nx, ny) {
  const x = nx < 0.33 ? 'west' : nx > 0.66 ? 'east' : 'center';
  const y = ny < 0.33 ? 'north' : ny > 0.66 ? 'south' : 'mid';
  return `${y}-${x}`;
}

function classify(samples) {
  if (!samples.length) {
    return { kind: 'none', force: 0, speed: 0, path: 0, duration: 0 };
  }
  const first = samples[0];
  const last = samples[samples.length - 1];
  const duration = Math.max(1, last.t - first.t);
  let path = 0;
  for (let i = 1; i < samples.length; i++) {
    path += hypot(samples[i].x - samples[i - 1].x, samples[i].y - samples[i - 1].y);
  }
  const force = samples.reduce((s, p) => s + (p.pressure ?? 0.45), 0) / samples.length;
  const speed = path / (duration / 1000);

  let kind = 'contact';
  if (duration < 160 && path < 14) kind = 'tap';
  else if (path < 20 && duration >= 400) kind = force > 0.6 ? 'press' : 'rest';
  else if (speed > 850) kind = 'swipe';
  else if (path > 48) kind = 'trace';
  else kind = 'glide';

  return { kind, force, speed, path, duration, zone: zoneOf(last.nx, last.ny) };
}

function awarenessCopy(state) {
  const { kind, force, speed, zone } = state;
  const forceWord =
    force < 0.3 ? 'feather' : force < 0.55 ? 'light' : force < 0.75 ? 'steady' : 'heavy';
  const speedWord =
    speed < 100 ? 'still' : speed < 350 ? 'slow' : speed < 800 ? 'moving' : 'fast';

  const lines = {
    tap: `Tap registered. Brief contact, ${forceWord} force, ${zone}.`,
    press: `Press held. TouchAI stays aware of sustained ${forceWord} force in ${zone}.`,
    rest: `Resting contact. Low motion, ${forceWord} presence in ${zone}.`,
    swipe: `Swipe. Fast path across ${zone} — ${speedWord}, ${forceWord}.`,
    trace: `Trace. Continuous path — TouchAI tracked motion through ${zone}.`,
    glide: `Glide. Soft motion, ${forceWord} force, ${speedWord}, ${zone}.`,
    contact: `Contact. Touch-aware state updated in ${zone}.`,
    none: 'No contact yet. TouchAI is touch-aware and waiting.',
  };

  return {
    headline: kind === 'none' ? 'Waiting' : kind.charAt(0).toUpperCase() + kind.slice(1),
    detail: lines[kind] ?? lines.contact,
    forceWord,
    speedWord,
  };
}

/**
 * Create TouchAI — a Touch-Aware AI runtime.
 */
export function createTouchAI(options = {}) {
  const memory = [];
  let live = null;
  let awake = false;
  const listeners = new Set();

  function emit(type, payload) {
    for (const fn of listeners) fn(type, payload);
    options.onEvent?.(type, payload);
  }

  function samplePoint(point) {
    return {
      x: point.x,
      y: point.y,
      nx: clamp(point.nx, 0, 1),
      ny: clamp(point.ny, 0, 1),
      pressure: clamp(point.pressure ?? 0.45, 0, 1),
      t: performance.now(),
    };
  }

  /** Begin / update / end a contact. Returns awareness snapshot on end. */
  function sense(phase, point = {}) {
    if (phase === 'start') {
      awake = true;
      live = { id: `c_${Date.now().toString(36)}`, samples: [samplePoint(point)] };
      emit('aware:start', { id: live.id, point: live.samples[0] });
      return snapshot('live');
    }

    if (phase === 'move' && live) {
      live.samples.push(samplePoint(point));
      emit('aware:move', { id: live.id, point: live.samples.at(-1) });
      return snapshot('live');
    }

    if (phase === 'end' && live) {
      const stats = classify(live.samples);
      const copy = awarenessCopy(stats);
      const entry = {
        id: live.id,
        at: new Date().toISOString(),
        ...stats,
        ...copy,
        samples: live.samples.length,
      };
      memory.unshift(entry);
      if (memory.length > 50) memory.length = 50;
      emit('aware', entry);
      live = null;
      return entry;
    }

    return snapshot('idle');
  }

  function snapshot(mode) {
    if (mode === 'live' && live) {
      const stats = classify(live.samples);
      const copy = awarenessCopy(stats);
      return { mode: 'live', awake: true, ...stats, ...copy };
    }
    const last = memory[0];
    if (last) return { mode: 'idle', awake, last };
    return { mode: 'idle', awake, ...awarenessCopy({ kind: 'none', force: 0, speed: 0, zone: 'center' }) };
  }

  /** Language interface grounded in touch awareness */
  function ask(question) {
    const q = (question || '').trim().toLowerCase();
    const last = memory[0];

    if (/who|what are you|what is touchai/.test(q)) {
      return {
        text: 'TouchAI is Touch-Aware AI. It stays aware of contact — force, motion, place — and turns that into understanding.',
      };
    }
    if (!last) {
      return { text: 'No touch in memory yet. Make contact on the field so TouchAI can become aware.' };
    }
    if (/last|feel|felt|aware|sense|what/.test(q)) {
      return { text: last.detail, awareness: last };
    }
    if (/force|pressure|hard|soft/.test(q)) {
      return { text: `Last force felt ${last.forceWord} (${(last.force * 100).toFixed(0)}%).`, awareness: last };
    }
    if (/where|zone|place/.test(q)) {
      return { text: `Last contact zone: ${last.zone}.`, awareness: last };
    }
    return {
      text: `Touch-aware memory: ${last.headline.toLowerCase()} in ${last.zone}. Ask about force, place, or what I last felt.`,
      awareness: last,
    };
  }

  return {
    version: VERSION,
    product: PRODUCT,
    category: CATEGORY,
    tagline: 'Touch-Aware AI',
    sense,
    ask,
    state: () => snapshot(live ? 'live' : 'idle'),
    memory: () => [...memory],
    clear: () => { memory.length = 0; awake = false; },
    on: (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}

export default createTouchAI;
