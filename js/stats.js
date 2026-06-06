export class SessionStats {
  constructor() {
    this.queries = 0;
    this.totalTokens = 0;
    this.latencies = [];
    this.lastLatency = null;
  }

  record(latencyMs, tokens) {
    this.queries++;
    this.lastLatency = latencyMs;
    this.latencies.push(latencyMs);
    this.totalTokens += tokens;
    this.render();
    this.renderMini(document.querySelector('.stats-mini'));
  }

  get avgLatency() {
    if (!this.latencies.length) return null;
    return this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length;
  }

  render() {
    const fmt = (ms) => ms != null ? `${Math.round(ms)}ms` : '—';
    const last = document.getElementById('statLast');
    if (last) last.textContent = fmt(this.lastLatency);
    const avg = document.getElementById('statAvg');
    if (avg) avg.textContent = fmt(this.avgLatency);
    const q = document.getElementById('statQueries');
    if (q) q.textContent = String(this.queries);
    const t = document.getElementById('statTokens');
    if (t) t.textContent = String(this.totalTokens);
  }

  renderMini(container) {
    if (!container) return;
    const fmt = (ms) => ms != null ? `${Math.round(ms)}ms` : '—';
    container.innerHTML = `
      <div class="nav-label">Session Stats</div>
      <div class="stats-mini-grid">
        <div><span>Last</span><span>${fmt(this.lastLatency)}</span></div>
        <div><span>Avg</span><span>${fmt(this.avgLatency)}</span></div>
        <div><span>Queries</span><span>${this.queries}</span></div>
        <div><span>Tokens</span><span>${this.totalTokens}</span></div>
      </div>
    `;
  }
}

export function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}
