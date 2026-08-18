import { formatPct, formatUsd } from '../../format.js';
import { escapeHtml, field, pill } from '../dom.js';

export function renderProblems(state) {
  return `
    <div class="page-head">
      <div>
        <p class="eyebrow">01 — Problem detection</p>
        <h1>Sized, evidenced problems — not decks.</h1>
      </div>
    </div>

    <div class="grid-2">
      <section class="panel">
        <header class="panel-h"><h2>Ingest a signal</h2><span>replaces pitching</span></header>
        <form data-form="detect" class="form">
          ${field('Cluster', `<input name="cluster" required placeholder="invoice-to-cash matching" />`)}
          ${field('Title', `<input name="title" required placeholder="What is actually going wrong?" />`)}
          ${field('Summary', `<textarea name="summary" rows="3" placeholder="Evidence, not a narrative."></textarea>`)}
          <div class="form-row">
            ${field('Source', `<select name="source">
              <option value="payments">payments</option>
              <option value="usage">usage</option>
              <option value="ops-telemetry">ops-telemetry</option>
              <option value="complaints">complaints</option>
              <option value="pricing">pricing</option>
            </select>`)}
            ${field('Weight 0–1', `<input name="weight" type="number" min="0.05" max="1" step="0.05" value="0.6" required />`)}
          </div>
          <button class="btn btn-ember" type="submit">Cluster into a problem</button>
        </form>
      </section>

      <section class="panel">
        <header class="panel-h"><h2>How sizing works</h2></header>
        <p>Addressable pain = frequency × severity. Suggested capital is a conservative slice of annual pain, scaled by evidence. Suggested share sits above the LP promised rate so the spread is real before a bid is accepted.</p>
        <p class="muted">Pitching is not an input. If it isn’t in the signals, it isn’t in the price.</p>
      </section>
    </div>

    <div class="stack">
      ${state.problems.map((p) => problemCard(p)).join('')}
    </div>
  `;
}

function problemCard(problem) {
  const s = problem.sizing;
  return `
    <section class="panel problem-card">
      <header class="panel-h">
        <div>
          <h2>${escapeHtml(problem.title)}</h2>
          <p class="muted">${escapeHtml(problem.cluster)} · evidence ${problem.evidence}/100 · ${problem.signals.length} signals</p>
        </div>
        ${pill(problem.status)}
      </header>
      <p>${escapeHtml(problem.summary || 'No summary yet.')}</p>
      <ul class="signals">
        ${problem.signals.map((sig) => `<li><span class="pill">${escapeHtml(sig.source)}</span> ${escapeHtml(sig.excerpt || sig.cluster)} <span class="muted">w${sig.weight}</span></li>`).join('')}
      </ul>
      ${
        s
          ? `<dl class="stats">
              <div><dt>Monthly pain</dt><dd>${formatUsd(s.monthly)}</dd></div>
              <div><dt>Annual addressable</dt><dd>${formatUsd(s.addressableAnnual)}</dd></div>
              <div><dt>Suggested capital</dt><dd>${formatUsd(s.suggestedCapital)}</dd></div>
              <div><dt>Suggested share</dt><dd>${formatPct(s.suggestedShareRate)}</dd></div>
              <div><dt>Confidence</dt><dd>${formatPct(s.confidence)}</dd></div>
              <div><dt>Risk</dt><dd>${formatPct(s.risk)}</dd></div>
            </dl>`
          : ''
      }
      ${
        problem.status === 'detected'
          ? `<form data-form="size" data-id="${escapeHtml(problem.id)}" class="form form-inline">
              ${field('Frequency / month', `<input name="frequencyPerMonth" type="number" min="1" step="1" required />`)}
              ${field('Severity $ / event', `<input name="severityUsd" type="number" min="1" step="1" required />`)}
              <button class="btn" type="submit">Size & price</button>
            </form>`
          : ''
      }
      ${
        problem.status === 'sized'
          ? `<button class="btn btn-ember" data-action="post" data-id="${escapeHtml(problem.id)}">Post to market</button>`
          : ''
      }
    </section>
  `;
}
