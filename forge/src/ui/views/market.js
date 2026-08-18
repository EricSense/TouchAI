import { rankBids } from '../../engine/index.js';
import { formatPct, formatUsd } from '../../format.js';
import { escapeHtml, field, pill } from '../dom.js';

export function renderMarket(state) {
  const posted = state.problems.filter((p) => ['posted', 'awarded'].includes(p.status));
  return `
    <div class="page-head">
      <div>
        <p class="eyebrow">02 — Open bidding</p>
        <h1>Best-priced, most credible bid wins.</h1>
      </div>
      <p class="page-note">No personality contest. No warm intro. Allocator is liable for the award.</p>
    </div>

    ${
      posted.length
        ? posted.map((p) => marketCard(state, p)).join('')
        : `<section class="panel"><p>Nothing is posted. Size a problem, then post it.</p></section>`
    }
  `;
}

function marketCard(state, problem) {
  const bids = state.bids.filter((b) => b.problemId === problem.id);
  const open = bids.filter((b) => b.status === 'open');
  const ranked = open.length ? rankBids(open, problem, state.pool.lpPromisedRate) : [];
  const awarded = problem.status === 'awarded';

  return `
    <section class="panel">
      <header class="panel-h">
        <div>
          <h2>${escapeHtml(problem.title)}</h2>
          <p class="muted">Ask up to ${formatUsd(problem.sizing.suggestedCapital)} · share target ${formatPct(problem.sizing.suggestedShareRate)} · LP floor ${formatPct(state.pool.lpPromisedRate)}</p>
        </div>
        ${pill(problem.status)}
      </header>

      ${
        bids.length
          ? `<div class="table-wrap"><table>
              <thead><tr><th>Bidder</th><th>Type</th><th>Ask</th><th>Share</th><th>Term</th><th>Score</th><th></th></tr></thead>
              <tbody>
                ${[...bids]
                  .sort((a, b) => (b.score || 0) - (a.score || 0))
                  .map((bid) => {
                    const top = ranked[0]?.bid.id === bid.id;
                    return `<tr class="${top && bid.status === 'open' ? 'is-top' : ''}">
                      <td>${escapeHtml(bid.bidder.name)} ${top && bid.status === 'open' ? '<span class="muted">top score</span>' : ''}</td>
                      <td>${pill(bid.bidder.type)}</td>
                      <td class="num">${formatUsd(bid.capitalAsk)}</td>
                      <td class="num">${formatPct(bid.shareRate)}</td>
                      <td class="num">${bid.timelineWeeks}w</td>
                      <td class="num">${bid.score ?? '—'}</td>
                      <td>${
                        bid.status === 'open' && !awarded
                          ? `<button class="btn btn-small btn-ember" data-action="award" data-id="${escapeHtml(problem.id)}" data-bid="${escapeHtml(bid.id)}">Award</button>`
                          : pill(bid.status)
                      }</td>
                    </tr>`;
                  })
                  .join('')}
              </tbody>
            </table></div>`
          : `<p class="muted">No bids yet.</p>`
      }

      ${
        awarded
          ? instantiateBlock(state, problem)
          : `<details class="bid-form">
              <summary>Submit a bid</summary>
              <form data-form="bid" data-id="${escapeHtml(problem.id)}" class="form">
                <div class="form-row">
                  ${field('Name', `<input name="name" required placeholder="Operator, team, or agent" />`)}
                  ${field('Type', `<select name="type"><option value="solo">solo</option><option value="team">team</option><option value="agent">agent</option></select>`)}
                </div>
                <div class="form-row">
                  ${field('Capital ask', `<input name="capitalAsk" type="number" min="1000" step="1000" required />`)}
                  ${field('Outcome share (0–1)', `<input name="shareRate" type="number" min="0.13" max="0.35" step="0.01" required />`)}
                  ${field('Term (weeks)', `<input name="timelineWeeks" type="number" min="1" max="12" step="1" value="6" required />`)}
                  ${field('Credibility 0–1', `<input name="credibility" type="number" min="0" max="1" step="0.05" value="0.6" required />`)}
                </div>
                ${field('Plan', `<textarea name="plan" rows="2" required placeholder="How the outcome will be produced and verified."></textarea>`)}
                <button class="btn" type="submit">Bid</button>
              </form>
            </details>`
      }
    </section>
  `;
}

function instantiateBlock(state, problem) {
  const exists = state.ventures.some((v) => v.problemId === problem.id && v.status !== 'dissolved');
  if (exists) {
    return `<p class="muted">Shell already instantiated. Track it under Ventures.</p>`;
  }
  return `<button class="btn btn-ember" data-action="instantiate" data-id="${escapeHtml(problem.id)}">Instantiate disposable venture</button>`;
}
