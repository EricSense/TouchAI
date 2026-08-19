import { createTouchAI } from './touchai.js';

const field = document.getElementById('field');
const canvas = document.getElementById('trails');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');
const detailEl = document.getElementById('detail');
const meterForce = document.getElementById('meterForce');
const meterMotion = document.getElementById('meterMotion');
const meterZone = document.getElementById('meterZone');
const logEl = document.getElementById('awareLog');
const askForm = document.getElementById('askForm');
const askInput = document.getElementById('askInput');

const ai = createTouchAI();

let drawing = false;
let last = null;

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
  const pressure = typeof src.pressure === 'number' && src.pressure > 0 ? src.pressure : 0.5;
  return { x, y, nx: x / Math.max(rect.width, 1), ny: y / Math.max(rect.height, 1), pressure };
}

function paint(from, to, pressure) {
  if (!from || !to) return;
  ctx.strokeStyle = `rgba(61, 126, 255, ${0.2 + pressure * 0.65})`;
  ctx.lineWidth = 2 + pressure * 7;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
}

function fade() {
  ctx.fillStyle = 'rgba(8, 10, 14, 0.05)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  requestAnimationFrame(fade);
}

function setVoice(title, detail) {
  statusEl.classList.remove('in');
  detailEl.classList.remove('in');
  void statusEl.offsetWidth;
  statusEl.textContent = title;
  detailEl.textContent = detail;
  statusEl.classList.add('in');
  detailEl.classList.add('in');
}

function setMeters(a) {
  meterForce.style.width = `${Math.round((a.force || 0) * 100)}%`;
  meterMotion.style.width = `${Math.min(100, Math.round((a.speed || 0) / 12))}%`;
  meterZone.textContent = a.zone || a.last?.zone || '—';
}

function renderLog() {
  const items = ai.memory();
  logEl.innerHTML = items.length
    ? items.slice(0, 8).map((m) => `
        <li>
          <strong>${m.headline}</strong>
          <span>${m.zone} · ${m.forceWord} · ${m.speedWord}</span>
        </li>
      `).join('')
    : '<li class="empty">Awareness log empty</li>';
}

function onStart(e) {
  e.preventDefault();
  drawing = true;
  field.classList.add('live');
  const p = pointFromEvent(e);
  last = p;
  const snap = ai.sense('start', p);
  setVoice('Aware', snap.detail);
  setMeters(snap);
  paint(p, p, p.pressure);
}

function onMove(e) {
  if (!drawing) return;
  e.preventDefault();
  const p = pointFromEvent(e);
  const snap = ai.sense('move', p);
  setMeters(snap);
  paint(last, p, p.pressure);
  last = p;
}

function onEnd(e) {
  if (!drawing) return;
  e.preventDefault();
  drawing = false;
  field.classList.remove('live');
  const felt = ai.sense('end');
  last = null;
  if (felt) {
    setVoice(felt.headline, felt.detail);
    setMeters(felt);
    renderLog();
  }
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
  setVoice('TouchAI', answer.text);
  askInput.value = '';
});

window.addEventListener('resize', resize);
resize();
fade();
setVoice('TouchAI', 'Touch-Aware AI. Make contact — force, motion, and place enter awareness.');
renderLog();
