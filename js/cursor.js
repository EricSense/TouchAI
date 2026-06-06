export function initCursor(cursorEl) {
  let x = 0, y = 0;
  let cx = 0, cy = 0;
  let rafId = null;

  document.addEventListener('pointermove', (e) => {
    x = e.clientX;
    y = e.clientY;
    if (!rafId) rafId = requestAnimationFrame(tick);
  });

  function tick() {
    cx += (x - cx) * 0.18;
    cy += (y - cy) * 0.18;
    cursorEl.style.transform = `translate(${cx}px, ${cy}px)`;
    if (Math.abs(x - cx) > 0.5 || Math.abs(y - cy) > 0.5) {
      rafId = requestAnimationFrame(tick);
    } else {
      rafId = null;
    }
  }

  document.addEventListener('pointerover', (e) => {
    if (isInteractive(e.target)) cursorEl.classList.add('hover');
  });

  document.addEventListener('pointerout', (e) => {
    if (isInteractive(e.target)) cursorEl.classList.remove('hover');
  });

  document.addEventListener('pointerdown', () => cursorEl.classList.add('click'));
  document.addEventListener('pointerup', () => cursorEl.classList.remove('click'));
}

function isInteractive(el) {
  if (!el || el === document.body) return false;
  return el.matches(
    'button, a, input, textarea, select, [role="button"], .interactive, .device-item, .model-item, .memory-item'
  );
}
