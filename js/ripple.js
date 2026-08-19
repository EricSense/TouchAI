export function initRipples(layer) {
  document.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    spawnRipple(layer, e.clientX, e.clientY);
  });
}

function spawnRipple(layer, x, y) {
  const ripple = document.createElement('div');
  ripple.className = 'ripple';
  const size = 80 + Math.random() * 40;
  ripple.style.width = `${size}px`;
  ripple.style.height = `${size}px`;
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  layer.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
}
