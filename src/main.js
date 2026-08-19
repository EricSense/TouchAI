import { createTouchAI } from './touchai.js';

const field = document.getElementById('field');
const canvas = document.getElementById('trails');
const ctx = canvas.getContext('2d');
const voice = document.getElementById('voice');
const fieldHint = document.getElementById('fieldHint');
const ripple = document.getElementById('ripple');
const readout = document.getElementById('readout');
const askForm = document.getElementById('askForm');
const askInput = document.getElementById('askInput');

const ai = createTouchAI();

let drawing = false;
let last = null;
let sparks = [];

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = field.getBoundingClientRect();
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function pointFromEvent(e) {
  const rect = field.getBoundingClientRect();
  const src = e.touches?.[0] ?? e;
  const x = src.clientX - rect.left;
  const y = src.clientY - rect.top;
  const pressure = typeof src.pressure === 'number' && src.pressure > 0 ? src.pressure : 0.45;
  return {
    x,
    y,
    nx: x / rect.width,
    ny: y / rect.height,
    pressure,
  };
}

function speak(text) {
  voice.classList.remove('in');
  void voice.offsetWidth;
  voice.textContent = text;
  voice.classList.add('in');
}

function showUnderstanding(u) {
  readout.hidden = false;
  document.getElementById('rGesture').textContent = u.gesture;
  document.getElementById('rMaterial').textContent = u.materialLabel;
  document.getElementById('rPressure').textContent = u.pressureLabel;
  document.getElementById('rMotion').textContent = u.speedLabel;
  speak(u.text);
  fieldHint.textContent = 'Felt. Touch again, or ask what I understood.';
}

function burst(x, y, pressure) {
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  ripple.style.setProperty('--r', `${40 + pressure * 80}px`);
  ripple.classList.remove('go');
  void ripple.offsetWidth;
  ripple.classList.add('go');

  for (let i = 0; i < 8; i++) {
    const a = (Math.PI * 2 * i) / 8;
    sparks.push({
      x, y,
      vx: Math.cos(a) * (1.2 + pressure * 2),
      vy: Math.sin(a) * (1.2 + pressure * 2),
      life: 1,
    });
  }
}

function drawStroke(from, to, pressure) {
  if (!from) return;
  ctx.strokeStyle = `rgba(86, 224, 192, ${0.25 + pressure * 0.55})`;
  ctx.lineWidth = 1.5 + pressure * 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
}

function tick() {
  ctx.fillStyle = 'rgba(7, 9, 12, 0.06)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  sparks = sparks.filter((s) => s.life > 0);
  for (const s of sparks) {
    s.x += s.vx;
    s.y += s.vy;
    s.life -= 0.03;
    ctx.fillStyle = `rgba(86, 224, 192, ${s.life * 0.7})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
  requestAnimationFrame(tick);
}

function onStart(e) {
  e.preventDefault();
  drawing = true;
  const p = pointFromEvent(e);
  last = p;
  fieldHint.textContent = 'Sensing…';
  ai.sense('start', p);
  burst(p.x, p.y, p.pressure);
  drawStroke(p, p, p.pressure);
}

function onMove(e) {
  if (!drawing) return;
  e.preventDefault();
  const p = pointFromEvent(e);
  ai.sense('move', p);
  drawStroke(last, p, p.pressure);
  last = p;
}

function onEnd(e) {
  if (!drawing) return;
  e.preventDefault();
  drawing = false;
  const felt = ai.sense('end');
  last = null;
  if (felt) showUnderstanding(felt);
}

field.addEventListener('pointerdown', onStart);
field.addEventListener('pointermove', onMove);
field.addEventListener('pointerup', onEnd);
field.addEventListener('pointercancel', onEnd);
field.addEventListener('pointerleave', (e) => { if (drawing) onEnd(e); });

askForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const q = askInput.value.trim();
  if (!q) return;
  const answer = ai.ask(q);
  speak(answer.text);
  askInput.value = '';
});

window.addEventListener('resize', resize);
resize();
tick();

// Fade residual trails gently by occasional soft clear — already via tick fill
speak(ai.ask('who are you').text);
