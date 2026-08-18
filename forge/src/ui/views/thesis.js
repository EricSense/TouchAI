export function renderThesis() {
  return `
    <article class="thesis">
      <p class="eyebrow">Seed pitch · 2026 · Phase 1 manual loop</p>
      <h1>The capital that<br>builds its own startups.</h1>
      <p class="lede">FORGE is an AI-native fund that detects problems, instantiates disposable ventures to solve them, and gets repaid as a share of verified outcomes — no pitch decks, no cap tables, no company that outlives its use.</p>
      <div class="cta-row">
        <a class="btn btn-ember" href="#loop">Open the live loop</a>
        <a class="btn btn-ghost" href="#risk">Read the risks first</a>
      </div>

      <section>
        <h2>The old model was built for a slower world</h2>
        <p>Venture capital’s rituals exist because information and judgment used to be slow. They aren’t anymore.</p>
        <div class="quad">
          <div>
            <h3>Months of pitching</h3>
            <p>Founders sell a narrative before they’re allowed to build anything real.</p>
          </div>
          <div>
            <h3>Pattern-matched bets</h3>
            <p>Investors back personality and pedigree, not verified evidence of a problem.</p>
          </div>
          <div>
            <h3>Zombie companies</h3>
            <p>Startups persist past usefulness — dissolving them is legally and socially costly.</p>
          </div>
          <div>
            <h3>Slow-trust structures</h3>
            <p>Equity, boards, and 10-year cycles exist to manage trust in a world without live data.</p>
          </div>
        </div>
      </section>

      <section>
        <h2>AI didn’t just make investing faster.</h2>
        <p>It collapsed the cost of judgment, coordination, and execution. Once those are nearly free, the fund, the startup, and the funding round stop being the only way to organize a bet on the future — they’re just the shape that bet used to have to take.</p>
        <table class="compare">
          <thead><tr><th>Old model</th><th>FORGE</th></tr></thead>
          <tbody>
            <tr><td>Pitch a founder</td><td>Detect a problem</td></tr>
            <tr><td>Fund a company</td><td>Instantiate a venture</td></tr>
            <tr><td>Hold equity</td><td>Get paid on outcomes</td></tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>Three layers replace pitching, the wrapper, and equity</h2>
        <ol class="layers">
          <li>
            <span>01</span>
            <div>
              <h3>Problem detection</h3>
              <p>Scan pricing gaps, complaint patterns, operational bottlenecks. Surface sized, evidenced problems instead of waiting for a deck.</p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <h3>Disposable ventures</h3>
              <p>A cleared problem instantiates a lightweight shell, an ops/agent stack, and a contracted team. It scales, plateaus, or dissolves in weeks.</p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <h3>Outcome-linked capital</h3>
              <p>No cap table, no board seat. Capital is repaid as a live share of verified outcomes. When the stream ends, so does the obligation.</p>
            </div>
          </li>
        </ol>
      </section>

      <section>
        <h2>Why this is enforceable now</h2>
        <div class="quad">
          <div>
            <h3>Judgment is cheap</h3>
            <p>Matching problems to solutions and pricing risk continuously used to require a full investment team.</p>
          </div>
          <div>
            <h3>Agentic execution</h3>
            <p>Real tooling can run parts of a live operating business — support, ops, pieces of sales and engineering.</p>
          </div>
          <div>
            <h3>Live verification</h3>
            <p>Payments, usage, and telemetry can be checked in real time, which is what makes outcome repayment bind.</p>
          </div>
          <div>
            <h3>Accountability stays human</h3>
            <p>Phase 1 does not auto-allocate. Every award, instantiation, and dissolution is signed by a liable allocator.</p>
          </div>
        </div>
      </section>

      <section class="ask">
        <h2>Let’s build the first loop.</h2>
        <p>This build is the Phase 1 pilot: one vertical with clean outcome data (B2B ops automation). AI assists; humans decide. The engine already prices problems, scores bids, instantiates shells, verifies outcomes, and settles the spread.</p>
        <a class="btn btn-ember" href="#loop">Operate the pilot</a>
      </section>
    </article>
  `;
}
