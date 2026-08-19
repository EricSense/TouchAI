/**
 * TouchAI — building for AI to touch.
 * The field is the product: contact creates presence.
 */

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const ripples = document.getElementById('ripples');
const replies = document.getElementById('replies');
const field = document.getElementById('field');
const hero = document.querySelector('.hero');
const cta = document.getElementById('cta');

const POINTS = [];
const MAX_POINTS = 48;
let w = 0;
let h = 0;
let dpr = 1;
let started = false;
let pointer = { x: 0.7, y: 0.35, active: false };

const VOICES = [
  'Contact.',
  'I feel that.',
  'Here.',
  'Touch received.',
  'Presence.',
  'The world presses back.',
  'I’m at your hand.',
  'Signal.',
  'AI to touch.',
  'Still here.',
  'Surface awake.',
  'That reached me.',
];

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  w = window.innerWidth;
  h = window.innerHeight;
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function addRipple(x, y, strength = 1) {
  const el = document.createElement('div');
  el.className = 'ripple';
  const size = 80 + strength * 140;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  ripples.appendChild(el);
  setTimeout(() => el.remove(), 1100);
}

function speakAt(x, y) {
  const el = document.createElement('div');
  el.className = 'reply';
  el.textContent = VOICES[Math.floor(Math.random() * VOICES.length)];
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  replies.appendChild(el);
  setTimeout(() => el.classList.add('fade'), 1600);
  setTimeout(() => el.remove(), 2200);
}

function contact(x, y, strength = 1) {
  if (!started) {
    started = true;
    hero?.classList.add('started');
    if (cta) cta.textContent = 'Keep touching — AI meets you here';
  }

  POINTS.push({
    x,
    y,
    life: 1,
    r: 6 + strength * 10,
    born: performance.now(),
  });
  if (POINTS.length > MAX_POINTS) POINTS.shift();

  addRipple(x, y, strength);
  if (strength > 0.35) speakAt(x, y);
}

function onPointer(e) {
  const x = e.clientX ?? e.touches?.[0]?.clientX;
  const y = e.clientY ?? e.touches?.[0]?.clientY;
  if (x == null || y == null) return;
  pointer = { x, y, active: true };
  contact(x, y, e.type.includes('move') ? 0.25 : 1);
}

function onPointerUp() {
  pointer.active = false;
}

field.addEventListener('pointerdown', onPointer);
field.addEventListener('pointermove', (e) => {
  if (e.buttons || e.pressure > 0) onPointer(e);
  else pointer = { x: e.clientX, y: e.clientY, active: false };
});
field.addEventListener('pointerup', onPointerUp);
field.addEventListener('pointercancel', onPointerUp);
field.addEventListener('pointerleave', onPointerUp);

// Soft ambient drift even before first touch
function seedAmbient() {
  const x = w * (0.55 + Math.random() * 0.3);
  const y = h * (0.25 + Math.random() * 0.25);
  POINTS.push({ x, y, life: 0.35, r: 18, born: performance.now(), ambient: true });
}

function draw(now) {
  ctx.clearRect(0, 0, w, h);

  // soft vignette field grain via sparse dots
  ctx.fillStyle = 'rgba(244,241,236,0.015)';
  for (let i = 0; i < 40; i++) {
    const gx = (Math.sin(now * 0.0002 + i * 12.1) * 0.5 + 0.5) * w;
    const gy = (Math.cos(now * 0.00015 + i * 7.7) * 0.5 + 0.5) * h;
    ctx.beginPath();
    ctx.arc(gx, gy, 1, 0, Math.PI * 2);
    ctx.fill();
  }

  // connection web between recent contacts
  for (let i = 0; i < POINTS.length; i++) {
    for (let j = i + 1; j < POINTS.length; j++) {
      const a = POINTS[i];
      const b = POINTS[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 180) {
        const alpha = (1 - dist / 180) * 0.18 * Math.min(a.life, b.life);
        ctx.strokeStyle = `rgba(255,90,54,${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  for (let i = POINTS.length - 1; i >= 0; i--) {
    const p = POINTS[i];
    const age = (now - p.born) / 1000;
    p.life = Math.max(0, 1 - age / (p.ambient ? 4 : 2.8));
    if (p.life <= 0) {
      POINTS.splice(i, 1);
      continue;
    }

    const radius = p.r * (0.7 + (1 - p.life) * 0.8);
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius * 3);
    g.addColorStop(0, `rgba(255,90,54,${0.35 * p.life})`);
    g.addColorStop(0.4, `rgba(255,90,54,${0.12 * p.life})`);
    g.addColorStop(1, 'rgba(255,90,54,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius * 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(244,241,236,${0.85 * p.life})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, Math.max(2, radius * 0.25), 0, Math.PI * 2);
    ctx.fill();
  }

  // idle presence near pointer or default
  const px = pointer.active ? pointer.x : w * 0.72;
  const py = pointer.active ? pointer.y : h * 0.32;
  const pulse = 0.5 + Math.sin(now * 0.003) * 0.5;
  const idle = ctx.createRadialGradient(px, py, 0, px, py, 120 + pulse * 40);
  idle.addColorStop(0, `rgba(255,90,54,${0.08 + pulse * 0.05})`);
  idle.addColorStop(1, 'rgba(255,90,54,0)');
  ctx.fillStyle = idle;
  ctx.beginPath();
  ctx.arc(px, py, 160, 0, Math.PI * 2);
  ctx.fill();

  requestAnimationFrame(draw);
}

window.addEventListener('resize', resize);
resize();
seedAmbient();
setInterval(seedAmbient, 3200);
requestAnimationFrame(draw);
