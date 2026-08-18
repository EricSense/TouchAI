import { poolSnapshot } from '../../engine/index.js';
import { formatPct, formatUsd, fromNow, hashShort } from '../../format.js';
import { escapeHtml, pill } from '../dom.js';

export function renderCapital(state) {
  const pool = poolSnapshot(state);
  const identity = pool.identity;

  return `
    <div class="page-head">
      <div>
        <p class="eyebrow">03 — Outcome-linked capital</p>
        <h1>A continuous carry, realized as ventures produce.</h1>
      </div>
    </div>

    <section class="panel">
      <header class="panel-h">
        <h2>The capital loop</h2>
        <span class="${identity.balanced ? 'ok' : 'fail'}">${identity.balanced ? 'identity holds' : 'drift ' + identity.drift}</span>
      </header>
      <div class="pipeline">
        <div class="pipe"><span class="pipe-label">LPs fund</span><strong>${formatUsd(pool.committed)}</strong><span class="pipe-hint">pilot pool</span></div>
        <div class="pipe"><span class="pipe-label">Instantiated</span><strong>${formatUsd(pool.allocated)}</strong><span class="pipe-hint">in live shells</span></div>
        <div class="pipe"><span class="pipe-label">Verified live</span><strong>${formatUsd(pool.returned)}</strong><span class="pipe-hint">LP share of outcomes</span></div>
        <div class="pipe"><span class="pipe-label">Spread</span><strong>${formatUsd(pool.spreadEarned)}</strong><span class="pipe-hint">FORGE carry</span></div>
      </div>
    </section>

    <div class="grid-2">
      <section class="panel">
        <header class="panel-h"><h2>01 — Outcome spread</h2></header>
        <p>Each venture pays a share of verified gross outcomes. LPs are promised ${formatPct(pool.lpPromisedRate)} of that gross. The difference is FORGE’s continuous carry — booked as outcomes land, not at an exit.</p>
        <dl class="stats">
          <div><dt>LP promised</dt><dd>${formatPct(pool.lpPromisedRate)}</dd></div>
          <div><dt>LP returned</dt><dd>${formatUsd(pool.returned)}</dd></div>
          <div><dt>LP yield above capital</dt><dd>${formatUsd(pool.lpYield)}</dd></div>
          <div><dt>Spread earned</dt><dd>${formatUsd(pool.spreadEarned)}</dd></div>
        </dl>
      </section>
      <section class="panel">
        <header class="panel-h"><h2>02 — Platform fee</h2></header>
        <p>A ${formatPct(pool.platformFeeRate)} fee on venture instantiation — the shared detection, matching, and verification layer every shell runs on. Taken from the pool at launch, not from a cap table.</p>
        <dl class="stats">
          <div><dt>Dry powder</dt><dd>${formatUsd(pool.available)}</dd></div>
          <div><dt>Allocated</dt><dd>${formatUsd(pool.allocated)}</dd></div>
          <div><dt>Fees</dt><dd>${formatUsd(pool.platformFees)}</dd></div>
          <div><dt>Write-downs</dt><dd>${formatUsd(pool.writeDowns)}</dd></div>
        </dl>
      </section>
    </div>

    <section class="panel">
      <header class="panel-h">
        <h2>Books</h2>
        <span>available + allocated + write-downs + fees = committed + LP yield</span>
      </header>
      <p class="mono identity-line">
        ${formatUsd(pool.available)} + ${formatUsd(pool.allocated)} + ${formatUsd(pool.writeDowns)} + ${formatUsd(pool.platformFees)}
        = ${formatUsd(identity.uses)}
        &nbsp;|&nbsp;
        ${formatUsd(pool.committed)} + ${formatUsd(pool.lpYield)}
        = ${formatUsd(identity.sources)}
      </p>
    </section>

    <section class="panel">
      <header class="panel-h"><h2>Outcome ledger</h2><span>${state.outcomes.length} attested</span></header>
      ${
        state.outcomes.length
          ? `<div class="table-wrap"><table>
              <thead><tr><th>Venture</th><th>Type</th><th>Gross</th><th>Share</th><th>LP</th><th>Spread</th><th>Source</th><th>Hash</th><th>When</th></tr></thead>
              <tbody>
                ${state.outcomes.map((o) => {
                  const v = state.ventures.find((x) => x.id === o.ventureId);
                  return `<tr>
                    <td>${escapeHtml(v?.name || o.ventureId)}</td>
                    <td>${escapeHtml(o.type)}</td>
                    <td class="num">${formatUsd(o.grossValue)}</td>
                    <td class="num">${formatUsd(o.forgeShare)}</td>
                    <td class="num">${formatUsd(o.lpShare)}</td>
                    <td class="num">${formatUsd(o.spread)}</td>
                    <td>${pill(o.source)}</td>
                    <td class="mono">${hashShort(o.hash)}</td>
                    <td>${fromNow(o.occurredAt)}</td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table></div>`
          : `<p class="muted">No outcomes yet.</p>`
      }
    </section>
  `;
}
