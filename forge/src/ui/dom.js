export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function pill(status) {
  return `<span class="pill pill-${escapeHtml(status)}">${escapeHtml(status)}</span>`;
}

export function field(label, inputHtml) {
  return `<label class="field"><span>${escapeHtml(label)}</span>${inputHtml}</label>`;
}

export function moneyInput(name, value = '') {
  return `<input name="${name}" type="number" min="0" step="1" value="${escapeHtml(value)}" required />`;
}

export function emptyState(title, body) {
  return `<div class="empty"><strong>${escapeHtml(title)}</strong><p>${escapeHtml(body)}</p></div>`;
}
