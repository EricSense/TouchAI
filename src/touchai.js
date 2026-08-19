/**
 * TouchAI — an AI that understands Touch.
 * Sense contact. Interpret intent. Speak what it felt.
 */

export const VERSION = '1.0.0';

const MATERIALS = [
  { id: 'glass', label: 'cool glass', feel: 'slick, precise, reflective' },
  { id: 'silk', label: 'warm silk', feel: 'soft, slow, forgiving' },
  { id: 'grit', label: 'fine grit', feel: 'textured, resistive, awake' },
  { id: 'water', label: 'still water', feel: 'yielding, continuous, deep' },
];

const INTENTS = {
  tap: 'a quick tap — testing contact',
  hold: 'a steady press — holding attention',
  stroke: 'a stroke — reading the surface',
  scrub: 'a scrub — searching harder',
  linger: 'a linger — listening back',
  flutter: 'a flutter — restless curiosity',
  drag: 'a drag — moving something unseen',
};

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function dist(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

function materialAt(nx, ny) {
  // Four quadrants of the sensing field
  const col = nx < 0.5 ? 0 : 1;
  const row = ny < 0.5 ? 0 : 1;
  return MATERIALS[row * 2 + col];
}

function classifyGesture(samples) {
  if (!samples.length) return 'tap';
  const first = samples[0];
  const last = samples[samples.length - 1];
  const duration = Math.max(1, last.t - first.t);
  const travel = samples.reduce((sum, s, i) => {
    if (i === 0) return 0;
    return sum + dist(s, samples[i - 1]);
  }, 0);
  const avgPressure = samples.reduce((s, p) => s + (p.pressure ?? 0.5), 0) / samples.length;
  const speed = travel / (duration / 1000);

  if (duration < 180 && travel < 12) return 'tap';
  if (travel < 18 && duration >= 450) return avgPressure > 0.65 ? 'hold' : 'linger';
  if (speed > 900) return 'scrub';
  if (travel > 40 && duration < 400) return 'flutter';
  if (travel > 50) return 'stroke';
  return 'drag';
}

function pressureWords(p) {
  if (p < 0.25) return 'barely there';
  if (p < 0.45) return 'light';
  if (p < 0.7) return 'present';
  if (p < 0.9) return 'firm';
  return 'insistent';
}

function speedWords(speed) {
  if (speed < 80) return 'almost still';
  if (speed < 250) return 'slow';
  if (speed < 600) return 'even';
  if (speed < 1100) return 'quick';
  return 'urgent';
}

function composeUnderstanding(gesture, material, pressure, speed, nx, ny, pathLen) {
  const intent = INTENTS[gesture] ?? INTENTS.tap;
  const press = pressureWords(pressure);
  const pace = speedWords(speed);
  const where =
    ny < 0.33 ? 'near the top of the field' :
    ny > 0.66 ? 'low in the field' :
    nx < 0.33 ? 'toward the left edge' :
    nx > 0.66 ? 'toward the right edge' :
    'at the center';

  const lines = [
    `I felt ${intent}.`,
    `Contact was ${press} against ${material.label} — ${material.feel}.`,
    `Motion felt ${pace}${pathLen > 30 ? `, tracing about ${Math.round(pathLen)}px` : ''}, ${where}.`,
  ];

  // Emotional / meaning layer
  if (gesture === 'linger' || gesture === 'hold') {
    lines.push('You weren’t asking for speed. You were asking to be felt.');
  } else if (gesture === 'scrub') {
    lines.push('There’s impatience in that motion — as if the answer is under the surface.');
  } else if (gesture === 'stroke') {
    lines.push('That’s how someone learns a material: not by naming it, by moving across it.');
  } else if (gesture === 'tap') {
    lines.push('A probe. Hello, world — checking if I’m here.');
  } else if (gesture === 'flutter') {
    lines.push('Scattered contact. Curiosity without commitment yet.');
  } else {
    lines.push('I followed the path. Touch is a sentence; this one isn’t finished.');
  }

  return {
    text: lines.join(' '),
    lines,
    gesture,
    material: material.id,
    materialLabel: material.label,
    pressure,
    pressureLabel: press,
    speed,
    speedLabel: pace,
    where,
  };
}

/**
 * Create a TouchAI instance — an AI that understands touch.
 */
export function createTouchAI(options = {}) {
  const history = [];
  let active = null;
  const listeners = new Set();

  function emit(event, payload) {
    for (const fn of listeners) fn(event, payload);
    options.onEvent?.(event, payload);
  }

  function beginContact(point) {
    active = {
      id: `touch_${Date.now().toString(36)}`,
      samples: [{ ...point, t: performance.now() }],
      startedAt: Date.now(),
    };
    emit('contact:start', { id: active.id, point });
  }

  function moveContact(point) {
    if (!active) return;
    active.samples.push({ ...point, t: performance.now() });
    emit('contact:move', { id: active.id, point });
  }

  function endContact() {
    if (!active) return null;
    const understanding = understandSamples(active.samples);
    const entry = {
      id: active.id,
      at: new Date().toISOString(),
      ...understanding,
      sampleCount: active.samples.length,
    };
    history.unshift(entry);
    if (history.length > 40) history.length = 40;
    emit('understand', entry);
    active = null;
    return entry;
  }

  function understandSamples(samples) {
    const first = samples[0];
    const last = samples[samples.length - 1];
    const duration = Math.max(1, last.t - first.t);
    const pathLen = samples.reduce((sum, s, i) => (i ? sum + dist(s, samples[i - 1]) : 0), 0);
    const avgPressure = samples.reduce((s, p) => s + (p.pressure ?? 0.5), 0) / samples.length;
    const speed = pathLen / (duration / 1000);
    const nx = clamp(last.nx ?? last.x, 0, 1);
    const ny = clamp(last.ny ?? last.y, 0, 1);
    const material = materialAt(nx, ny);
    const gesture = classifyGesture(samples);
    return composeUnderstanding(gesture, material, avgPressure, speed, nx, ny, pathLen);
  }

  /**
   * Ingest a pointer/touch sample.
   * @param {'start'|'move'|'end'} phase
   * @param {{ x:number, y:number, nx:number, ny:number, pressure?:number }} point
   */
  function sense(phase, point) {
    if (phase === 'start') beginContact(point);
    else if (phase === 'move') moveContact(point);
    else if (phase === 'end') return endContact();
    return null;
  }

  /** Ask TouchAI in language — grounded in recent touch memory */
  function ask(question) {
    const q = (question || '').trim().toLowerCase();
    const last = history[0];

    if (!last) {
      return {
        text: 'I haven’t felt anything yet. Touch the field — pressure, motion, and place are how I understand.',
        kind: 'awaiting',
      };
    }

    if (/what.*(feel|felt|sense)/.test(q) || q === 'what did you feel?') {
      return { text: last.text, kind: 'recall', understanding: last };
    }
    if (/material|texture|surface|what.*(am i|is this)/.test(q)) {
      return {
        text: `Under your contact I read ${last.materialLabel} — ${MATERIALS.find((m) => m.id === last.material)?.feel}. Gesture: ${last.gesture}.`,
        kind: 'material',
        understanding: last,
      };
    }
    if (/pressure|hard|soft|force/.test(q)) {
      return {
        text: `Pressure felt ${last.pressureLabel} (${(last.pressure * 100).toFixed(0)}% of the scale I was given).`,
        kind: 'pressure',
        understanding: last,
      };
    }
    if (/intent|mean|want|why/.test(q)) {
      return {
        text: `${INTENTS[last.gesture]}. ${last.lines[last.lines.length - 1]}`,
        kind: 'intent',
        understanding: last,
      };
    }
    if (/who are you|what are you/.test(q)) {
      return {
        text: 'I’m TouchAI — an AI that understands Touch. Not chat about touch: contact, pressure, motion, and material as meaning.',
        kind: 'identity',
      };
    }

    return {
      text: `From the last contact (${last.gesture} on ${last.materialLabel}): ${last.lines[last.lines.length - 1]} Ask me what I felt, the material, the pressure, or the intent.`,
      kind: 'grounded',
      understanding: last,
    };
  }

  return {
    version: VERSION,
    name: 'TouchAI',
    tagline: 'An AI that understands Touch',
    materials: MATERIALS.map((m) => ({ ...m })),
    sense,
    ask,
    history: () => [...history],
    clear: () => { history.length = 0; },
    on: (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
  };
}

export default createTouchAI;
