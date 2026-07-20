import { PRODUCTS, HARDWARE_LAYERS, focusLine } from './focus.js';
import { renderFocusCheck } from './focus-ui.js';

const product = () => PRODUCTS.find((p) => p.id === 'device');

export function renderDeviceView(container, hw) {
  const p = product();

  container.innerHTML = `
    <div class="product-view device-view">
      <section class="product-hero device-hero">
        <p class="brand-mark compact">TouchAI</p>
        <p class="section-kicker">${p.num} · ${p.audience}</p>
        <h1 class="product-hero-title">${p.title}</h1>
        <p class="product-hero-tag">${p.tagline}</p>
        <p class="product-hero-lead">${p.what}</p>
        <div class="hero-actions">
          <button class="btn btn-primary interactive" data-nav="live">Open the Situated Agent</button>
          <button class="btn btn-ghost interactive" data-nav="sdk">Back to SDK</button>
        </div>
      </section>

      <section class="section">
        <p class="section-kicker">What it does</p>
        <h2 class="section-title">The intelligence that manages all assistants.</h2>
        <p class="section-lead">${p.does}</p>
        <div class="device-roles">
          <article class="device-role">
            <h3>Lives on your machine</h3>
            <p>Not a cloud tab. An agent rooted in this silicon, this thermal envelope, this power budget.</p>
          </article>
          <article class="device-role">
            <h3>Learns the situation</h3>
            <p>History and user layers compound — the longer it runs, the more specific its understanding becomes.</p>
          </article>
          <article class="device-role">
            <h3>Orchestrates assistants</h3>
            <p>Routes work across models and tools with knowledge of what this device can actually do right now.</p>
          </article>
        </div>
      </section>

      <section class="section arc-section">
        <p class="section-kicker">The long arc</p>
        <h2 class="section-title">Most capable — because most situated.</h2>
        <blockquote class="arc-quote">${p.arc}</blockquote>
      </section>

      <section class="section">
        <p class="section-kicker">This machine</p>
        <h2 class="section-title">Your Situated Agent already has a profile.</h2>
        <p class="section-lead">${focusLine(hw)}</p>
        ${hw ? renderDeviceProfile(hw) : ''}
        <div id="deviceFocusCheck"></div>
        <div class="closing-cta">
          <button class="btn btn-primary interactive" data-nav="live">Talk to it on this hardware</button>
        </div>
      </section>
    </div>
  `;

  container.querySelectorAll('[data-nav]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('touchai:nav', { detail: { view: btn.dataset.nav } }));
    });
  });

  renderFocusCheck(container.querySelector('#deviceFocusCheck'), 'device', hw);
}

function renderDeviceProfile(hw) {
  const a = hw.awareness;
  return `
    <div class="device-profile">
      <div class="device-profile-head">
        <div>
          <span class="live-pill">Situated agent · online</span>
          <h3>${hw.platform} · ${hw.formFactor}</h3>
          <p>${hw.arch} · ${hw.cores ?? '?'} cores · ${hw.ram}</p>
        </div>
        <div class="device-profile-stat">
          <span class="metric-val">${hw.layersActive}/${hw.layersTotal}</span>
          <span class="metric-label">Awareness layers</span>
        </div>
      </div>
      <div class="device-layer-grid">
        ${(hw.layers ?? []).map((l) => `
          <div class="device-layer">
            <span class="awareness-layer">${l.name}</span>
            <strong>${l.summary}</strong>
          </div>
        `).join('')}
      </div>
      <div class="device-insights">
        <div class="device-insight">
          <span>Thermal</span>
          <p>${a.thermal.state} · ${a.thermal.headroom}</p>
        </div>
        <div class="device-insight">
          <span>Power</span>
          <p>${a.power.level} · ${a.power.budget}</p>
        </div>
        <div class="device-insight">
          <span>User rhythm</span>
          <p>${a.user.rhythm} · ${a.user.signature}</p>
        </div>
        <div class="device-insight">
          <span>History</span>
          <p>${a.history.scans} scans · ${a.history.avgLatency}</p>
        </div>
      </div>
      <p class="device-layers-note">${HARDWARE_LAYERS.length} layers — the context cloud models never get.</p>
    </div>
  `;
}
