import { nextActions, poolSnapshot, priceVenture, rankBids } from '../../engine/index.js';
import { formatPct, formatUsd, fromNow } from '../../format.js';
import { escapeHtml, pill } from '../dom.js';

export function renderLoop(state) {
  const pool = poolSnapshot(state);
  const actions = nextActions(state);
  const posted = state.problems.filter((p) => p.status === 'posted').length;
  const live = state.ventures.filter((v) => v.status === 'live' || v.status === 'plateau');
  const recent = state.audit.slice(0, 8);

  return `
    <div class="page-head">
      <div>
        <p class="eyebrow">Execution model</p>
        <h1>Capital follows the problem, not the pitch.</h1>
      </div>
      <p class="page-note">0 pitch decks required · weeks not years · live outcome pricing</p>
    </div>

    <div class="pipeline">
      ${pipe('Detected', state.problems.length, 'problems')}
      ${pipe('On market', posted, 'open for bids')}
      ${pipe('Live shells', live.length, 'disposable ventures')}
      ${pipe('Verified', state.outcomes.length, 'outcomes')}
      ${pipe('Spread', formatUsd(pool.spreadEarned), 'continuous carry')}
    </div>

    <div class="grid-2">
      <section class="panel">
        <header class="panel-h">
          <h2>Needs a human</h2>
          <span>${actions.length} open</span>
        </header>
        ${
          actions.length
            ? `<ul class="action-list">${actions.map((a) => actionRow(a)).join('')}</ul>`
            : `<p class="muted">The loop is clear. Ingest a new signal or record an outcome.</p>`
        }
      </section>

      <section class="panel">
        <header class="panel-h">
          <h2>Pool</h2>
          <span class="${pool.identity.balanced ? 'ok' : 'fail'}">${pool.identity.balanced ? 'books balanced' : 'drift ' + pool.identity.drift}</span>
        </header>
        <dl class="stats">
          <div><dt>Committed</dt><dd>${formatUsd(pool.committed)}</dd></div>
          <div><dt>Dry powder</dt><dd>${formatUsd(pool.available)}</dd></div>
          <div><dt>Allocated</dt><dd>${formatUsd(pool.allocated)}</dd></div>
          <div><dt>LP returned</dt><dd>${formatUsd(pool.returned)}</dd></div>
          <div><dt>FORGE spread</dt><dd>${formatUsd(pool.spreadEarned)}</dd></div>
          <div><dt>Platform fees</dt><dd>${formatUsd(pool.platformFees)}</dd></div>
        </dl>
      </section>
    </div>

    <section class="panel">
      <header class="panel-h">
        <h2>Live marks</h2>
        <span>priced from verified outcomes</span>
      </header>
      ${
        live.length
          ? `<div class="table-wrap"><table>
              <thead><tr><th>Venture</th><th>Status</th><th>Share</th><th>Outstanding</th><th>Recovered</th><th>Weekly</th><th>Coverage</th><th>Dissolves</th></tr></thead>
              <tbody>
                ${live.map((v) => {
                  const mark = priceVenture(v, state.outcomes);
                  return `<tr>
                    <td><a href="#ventures">${escapeHtml(v.name)}</a></td>
                    <td>${pill(v.status)}</td>
                    <td class="num">${formatPct(v.shareRate)}</td>
                    <td class="num">${formatUsd(v.outstanding)}</td>
                    <td class="num">${formatUsd(v.recovered)}</td>
                    <td class="num">${formatUsd(mark.weekly)}</td>
                    <td class="num">${formatPct(mark.coverage)}</td>
                    <td>${fromNow(v.shell.dissolvesAt)}</td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table></div>`
          : `<p class="muted">No live shells. Award a bid, then instantiate.</p>`
      }
    </section>

    <section class="panel">
      <header class="panel-h">
        <h2>Market tape</h2>
        <span>open problems, ranked bids</span>
      </header>
      ${marketTape(state)}
    </section>

    <section class="panel">
      <header class="panel-h">
        <h2>Audit</h2>
        <span>every decision is attributable</span>
      </header>
      <ol class="audit">
        ${recent.map((e) => `
          <li>
            <span class="audit-action">${escapeHtml(e.action)}</span>
            <span>${escapeHtml(e.rationale)}</span>
            <span class="muted">${escapeHtml(e.actor.name)} · ${fromNow(e.at)}</span>
          </li>`).join('')}
      </ol>
    </section>
  `;
}

function pipe(label, value, hint) {
  return `<div class="pipe"><span class="pipe-label">${escapeHtml(label)}</span><strong>${escapeHtml(String(value))}</strong><span class="pipe-hint">${escapeHtml(hint)}</span></div>`;
}

function actionRow(action) {
  const href =
    action.kind === 'award' || action.kind === 'instantiate'
      ? '#market'
      : action.kind === 'dissolve'
        ? '#ventures'
        : '#problems';
  return `<li>
    <div>
      <strong>${escapeHtml(action.title)}</strong>
      <p>${escapeHtml(action.label)}</p>
    </div>
    <a class="btn btn-small" href="${href}">${escapeHtml(action.kind)}</a>
  </li>`;
}

function marketTape(state) {
  const posted = state.problems.filter((p) => p.status === 'posted');
  if (!posted.length) return `<p class="muted">Nothing on the market. Size and post a problem.</p>`;
  return posted.map((p) => {
    const open = state.bids.filter((b) => b.problemId === p.id && b.status === 'open');
    const ranked = open.length ? rankBids(open, p, state.pool.lpPromisedRate) : [];
    const top = ranked[0];
    return `<div class="tape-row">
      <div>
        <strong>${escapeHtml(p.title)}</strong>
        <p class="muted">${open.length} bid${open.length === 1 ? '' : 's'} · suggested ${formatUsd(p.sizing.suggestedCapital)} @ ${formatPct(p.sizing.suggestedShareRate)}</p>
      </div>
      <div class="tape-top">
        ${top ? `${escapeHtml(top.bid.bidder.name)} · score ${top.score} · ${formatUsd(top.bid.capitalAsk)} · ${formatPct(top.bid.shareRate)}` : 'awaiting bids'}
      </div>
    </div>`;
  }).join('');
}
