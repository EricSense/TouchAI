import { LEGAL_SHELL, MAX_TERM_WEEKS, OUTCOME_SOURCES } from '../../engine/index.js';
import { formatDate, hashShort } from '../../format.js';
import { escapeHtml, pill } from '../dom.js';

export function renderRisk(state) {
  const capitalActs = state.audit.filter((e) => ['award', 'instantiate', 'dissolve'].includes(e.action));
  const outcomes = state.outcomes;
  const tamperReady = outcomes.every((o) => o.verified && o.hash);

  return `
    <div class="page-head">
      <div>
        <p class="eyebrow">Risk, stated plainly</p>
        <h1>The reasons almost no one has built this.</h1>
      </div>
    </div>

    <div class="grid-3">
      <section class="panel">
        <h2>Accountability</h2>
        <p>Boards and pitches are fraud- and bad-judgment filters, not just friction. Someone must still be liable when capital is allocated badly.</p>
        <p class="ok">Phase 1: award, instantiate, and dissolve require the allocator role. The engine refuses operator-signed capital moves.</p>
      </section>
      <section class="panel">
        <h2>Legal reality</h2>
        <p>Instantiating and dissolving a company in weeks runs into employment, contract, and securities law built for durable entities.</p>
        <p class="ok">Phase 1 shells are ${escapeHtml(LEGAL_SHELL.kind)}, ${escapeHtml(LEGAL_SHELL.labor)}, ${escapeHtml(LEGAL_SHELL.securities)}, max ${MAX_TERM_WEEKS} weeks, equity ${LEGAL_SHELL.equity ? 'on' : 'off'}.</p>
      </section>
      <section class="panel">
        <h2>Verifiable trust</h2>
        <p>Outcome verification has to be genuinely tamper-resistant, or repayment collapses.</p>
        <p class="${tamperReady ? 'ok' : 'fail'}">${tamperReady ? 'Every recorded outcome carries a SHA-256 attestation over a canonical payload.' : 'Unverified outcomes in the ledger.'}</p>
      </section>
    </div>

    <section class="panel">
      <header class="panel-h"><h2>Liable allocator log</h2><span>${capitalActs.length} capital actions</span></header>
      <ol class="audit">
        ${
          capitalActs.length
            ? capitalActs.map((e) => `
              <li>
                <span class="audit-action">${escapeHtml(e.action)}</span>
                <span>${escapeHtml(e.rationale)}</span>
                <span class="muted">${escapeHtml(e.actor.name)} · ${escapeHtml(e.actor.role)} · ${formatDate(e.at)}</span>
              </li>`).join('')
            : `<li class="muted">No capital actions yet.</li>`
        }
      </ol>
    </section>

    <section class="panel">
      <header class="panel-h"><h2>Allowed verification channels</h2></header>
      <p>Only ${OUTCOME_SOURCES.map((s) => `<span class="pill">${s}</span>`).join(' ')} can attest an outcome. Spreadsheets and founder reports are not sources.</p>
      <div class="table-wrap"><table>
        <thead><tr><th>Outcome</th><th>Source</th><th>Nonce</th><th>Hash</th></tr></thead>
        <tbody>
          ${outcomes.slice(0, 8).map((o) => `<tr>
            <td>${escapeHtml(o.type)}</td>
            <td>${pill(o.source)}</td>
            <td class="mono">${escapeHtml(o.nonce)}</td>
            <td class="mono">${hashShort(o.hash)}</td>
          </tr>`).join('')}
        </tbody>
      </table></div>
    </section>

    <section class="panel">
      <header class="panel-h"><h2>Roadmap</h2><span>prove the mechanism, then automate</span></header>
      <ol class="layers">
        <li>
          <span>01</span>
          <div>
            <h3>Manual loop — this build</h3>
            <p>Problem detection, instantiation, and outcome tracking in one vertical. AI may assist; humans decide.</p>
          </div>
        </li>
        <li>
          <span>02</span>
          <div>
            <h3>AI-assisted</h3>
            <p>Automate detection and bid-matching. Keep capital-allocation and legal decisions human-reviewed.</p>
          </div>
        </li>
        <li>
          <span>03</span>
          <div>
            <h3>Selective autonomy</h3>
            <p>Extend automation to lower-risk decisions only, with liability and legal structure validated by Phase 1–2 data.</p>
          </div>
        </li>
      </ol>
    </section>
  `;
}
