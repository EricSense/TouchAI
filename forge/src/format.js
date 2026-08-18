const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const usdFine = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

const compact = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

export function formatUsd(n, { fine = false } = {}) {
  if (!Number.isFinite(n)) return '—';
  return (fine ? usdFine : usd).format(n);
}

export function formatCompact(n) {
  if (!Number.isFinite(n)) return '—';
  return compact.format(n);
}

export function formatPct(n, digits = 1) {
  if (!Number.isFinite(n)) return '—';
  return `${(n * 100).toFixed(digits)}%`;
}

export function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function fromNow(iso, now = Date.now()) {
  if (!iso) return '—';
  const delta = Date.parse(iso) - now;
  const abs = Math.abs(delta);
  const hour = 60 * 60 * 1000;
  const day = 24 * hour;
  if (abs < day) {
    const hours = Math.max(1, Math.round(abs / hour));
    return delta >= 0 ? `in ${hours}h` : `${hours}h ago`;
  }
  const days = Math.round(abs / day);
  if (days < 14) return delta >= 0 ? `in ${days}d` : `${days}d ago`;
  const weeks = Math.round(days / 7);
  return delta >= 0 ? `in ${weeks}w` : `${weeks}w ago`;
}

export function hashShort(hash) {
  if (!hash) return '—';
  return `${hash.slice(0, 8)}…${hash.slice(-4)}`;
}
