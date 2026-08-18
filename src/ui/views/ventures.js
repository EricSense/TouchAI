import { OUTCOME_SOURCES, priceVenture } from '../../engine/index.js';
import { formatDate, formatPct, formatUsd, fromNow, hashShort } from '../../format.js';
import { escapeHtml, field, pill } from '../dom.js';

export function renderVentures(state) {
  return `
    <div class="page-head">
      <div>
        <p class="eyebrow">02 — Disposable ventures</p>
        <h1>A company that is allowed to end.</h1>
      </div>
      <p class="page-note">Contractors only · no equity · 12-week max term · auto-dissolve</p>
    </div>

    ${
      state.ventures.length
        ? state.ventures.map((v) => ventureCard(state, v)).join('')
        : `<section class="panel"><p>No shells yet. Award a bid on the market, then instantiate.</p></section>`
    }
  `;
}

function ventureCard(state, venture) {
  const problem = state.problems.find((p) => p.id === venture.problemId);
  const mark = priceVenture(venture, state.outcomes);
  const stream = state.outcomes.filter((o) => o.ventureId === venture.id);
  const live = venture.status !== 'dissolved';

  return `
    <section class="panel venture">
      <header class="panel-h">
        <div>
          <h2>${escapeHtml(venture.name)}</h2>
          <p class="muted">${escapeHtml(problem?.title || '')} · ${escapeHtml(venture.team.lead)} (${escapeHtml(venture.team.kind)})</p>
        </div>
        ${pill(venture.status)}
      </header>

      <dl class="stats">
        <div><dt>Allocated</dt><dd>${formatUsd(venture.capitalAllocated)}</dd></div>
        <div><dt>Outstanding</dt><dd>${formatUsd(venture.outstanding)}</dd></div>
        <div><dt>Recovered</dt><dd>${formatUsd(venture.recovered)}</dd></div>
        <div><dt>Share</dt><dd>${formatPct(venture.shareRate)}</dd></div>
        <div><dt>Mark</dt><dd>${formatUsd(mark.mark)}</dd></div>
        <div><dt>Coverage</dt><dd>${formatPct(mark.coverage)}</dd></div>
      </dl>

      <div class="legal">
        <h3>Legal shell</h3>
        <p>${escapeHtml(venture.shell.kind)} · ${escapeHtml(venture.shell.labor)} · ${escapeHtml(venture.shell.securities)} · equity ${venture.shell.equity ? 'yes' : 'no'}</p>
        <p class="muted">Formed ${formatDate(venture.shell.formedAt)} · dissolves ${formatDate(venture.shell.dissolvesAt)} (${fromNow(venture.shell.dissolvesAt)})</p>
      </div>

      ${
        live
          ? `<div class="grid-2">
              <form data-form="outcome" data-id="${escapeHtml(venture.id)}" class="form">
                <h3>Record a verified outcome</h3>
                ${field('Type', `<input name="type" required placeholder="tickets_resolved_in_sla" />`)}
                <div class="form-row">
                  ${field('Quantity', `<input name="quantity" type="number" min="0.01" step="0.01" required />`)}
                  ${field('Unit value $', `<input name="unitValue" type="number" min="0" step="0.01" required />`)}
                  ${field('Source', `<select name="source">${OUTCOME_SOURCES.map((s) => `<option>${s}</option>`).join('')}</select>`)}
                </div>
                <button class="btn" type="submit">Attest & settle</button>
              </form>
              <div>
                <h3>End the obligation</h3>
                <p>When the outcome stream ends, the shell dissolves. Remaining outstanding capital is a write-down. There is no residual equity.</p>
                <button class="btn btn-danger" data-action="dissolve" data-id="${escapeHtml(venture.id)}">Dissolve</button>
              </div>
            </div>`
          : `<p class="muted">Dissolved ${formatDate(venture.dissolvedAt)}. Obligation ended.</p>`
      }

      ${
        stream.length
          ? `<div class="table-wrap"><table>
              <thead><tr><th>When</th><th>Type</th><th>Gross</th><th>FORGE</th><th>LP</th><th>Spread</th><th>Source</th><th>Hash</th></tr></thead>
              <tbody>
                ${stream.map((o) => `<tr>
                  <td>${fromNow(o.occurredAt)}</td>
                  <td>${escapeHtml(o.type)}</td>
                  <td class="num">${formatUsd(o.grossValue)}</td>
                  <td class="num">${formatUsd(o.forgeShare)}</td>
                  <td class="num">${formatUsd(o.lpShare)}</td>
                  <td class="num">${formatUsd(o.spread)}</td>
                  <td>${pill(o.source)}</td>
                  <td class="mono">${hashShort(o.hash)}</td>
                </tr>`).join('')}
              </tbody>
            </table></div>`
          : ''
      }
    </section>
  `;
}
