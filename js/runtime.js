import { RUNTIME_API, PILLARS } from './focus.js';

export function renderRuntimeSection() {
  const pillarMap = Object.fromEntries(PILLARS.map((p) => [p.id, p.label]));

  return `
    <section class="runtime-section" id="runtime">
      <h2 class="section-title">Runtime SDK</h2>
      <p class="section-sub">Embed TouchAI in any AI product. Every API maps to a focus pillar.</p>
      <div class="runtime-grid">
        ${RUNTIME_API.map((api) => `
          <div class="runtime-card">
            <div class="runtime-card-head">
              <code class="runtime-fn">${api.name}</code>
              <span class="runtime-pillar" data-pillar="${api.pillar}">${pillarMap[api.pillar]}</span>
            </div>
            <p class="runtime-desc">${api.desc}</p>
            <pre class="runtime-code"><code>${esc(api.code)}</code></pre>
          </div>
        `).join('')}
      </div>
      <div class="runtime-policy">
        <span class="runtime-policy-label">Network policy</span>
        <code>zero-egress · no fetch() during inference · WASM on local silicon</code>
      </div>
    </section>
  `;
}

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
