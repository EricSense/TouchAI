/** Loads public/data.json and hydrates the page; wires the touch playground. */

const FALLBACK = {
  lastUpdated: "2026-05-08",
  specVersion: "0.1.0",
  headline: "TouchAI",
  subhead:
    "Touch as a structured language for AI on devices: normalized streams in, haptic programs out, versioned envelopes for training.",
  layers: [
    {
      id: "input",
      title: "Input",
      subtitle: "Touch Language",
      body: "Pointer and touch paths become time-normalized TouchSample streams and GestureTokens.",
    },
    {
      id: "output",
      title: "Output",
      subtitle: "Haptics",
      body: "Semantic haptics compile to neutral pulse programs for each platform adapter.",
    },
    {
      id: "infra",
      title: "Infrastructure",
      subtitle: "Programs & envelopes",
      body: "TouchProgram rules plus TouchEventEnvelope JSONL for reproducible datasets.",
    },
  ],
  packages: [
    {
      name: "@touchai/touch-spec",
      summary: "Wire types + Zod schemas.",
      status: "shipped",
    },
    {
      name: "@touchai/touch-runtime",
      summary: "Segmentation, rules, haptic materialization.",
      status: "shipped",
    },
    {
      name: "@touchai/touch-dataset",
      summary: "JSONL helpers for envelopes.",
      status: "shipped",
    },
  ],
  next: ["Web haptics behind HapticProgram", "Playground imports @touchai/touch-adapter-web bundle"],
  links: {
    github: "https://github.com/EricSense/TouchAI",
    specVersionFile: "https://github.com/EricSense/TouchAI/blob/main/packages/touch-spec/src/version.ts",
  },
};

function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === "class") node.className = v;
    else if (k === "text") node.textContent = v;
    else if (k === "html") node.innerHTML = v;
    else node.setAttribute(k, String(v));
  }
  for (const c of children) node.appendChild(c);
  return node;
}

function render(data) {
  document.title = `${data.headline} — touch language for AI on devices`;

  const specPill = document.getElementById("spec-pill");
  if (specPill) specPill.textContent = `spec ${data.specVersion}`;

  const heroTitle = document.getElementById("hero-title");
  if (heroTitle) heroTitle.textContent = data.headline;

  const heroLead = document.getElementById("hero-lead");
  if (heroLead) heroLead.textContent = data.subhead;

  const pills = document.getElementById("hero-pills");
  if (pills) pills.hidden = false;
  const pillSpec = document.getElementById("pill-spec");
  if (pillSpec) pillSpec.textContent = data.specVersion;
  const pillUpdated = document.getElementById("pill-updated");
  if (pillUpdated) pillUpdated.textContent = data.lastUpdated;

  const gh = document.getElementById("nav-github");
  if (gh && data.links?.github) gh.href = data.links.github;

  const layersGrid = document.getElementById("layers-grid");
  if (layersGrid) {
    layersGrid.replaceChildren(
      ...data.layers.map((layer) =>
        el("article", { class: "card" }, [
          el("h3", { text: layer.title }),
          el("p", { class: "sub", text: layer.subtitle }),
          el("p", { text: layer.body }),
        ]),
      ),
    );
  }

  const pkgGrid = document.getElementById("packages-grid");
  if (pkgGrid) {
    pkgGrid.replaceChildren(
      ...data.packages.map((pkg) => {
        const badge = el("span", {
          class: `badge ${pkg.status === "shipped" ? "shipped" : "planned"}`,
          text: pkg.status,
        });
        const header = el("header", {}, [el("code", { text: pkg.name }), badge]);
        return el("article", { class: "pkg" }, [header, el("p", { text: pkg.summary })]);
      }),
    );
  }

  const nextList = document.getElementById("next-list");
  if (nextList) {
    nextList.replaceChildren(...data.next.map((t) => el("li", { text: t })));
  }

  const footLinks = document.getElementById("foot-links");
  if (footLinks && data.links) {
    const parts = [
      el("a", { href: data.links.github, text: "Repository" }),
      data.links.specVersionFile
        ? el("a", { href: data.links.specVersionFile, text: "Spec version (source)" })
        : null,
    ].filter(Boolean);
    footLinks.replaceChildren(
      ...parts.flatMap((a, i) => (i === 0 ? [a] : [document.createTextNode(" · "), a])),
    );
  }
}

function clamp01(n) {
  return Math.min(1, Math.max(0, n));
}

/** Same shape as `@touchai/touch-spec` TouchSample (phase strings match Zod enum). */
function sampleFromPointer(event, target, sessionStartMs) {
  const rect = target.getBoundingClientRect();
  const w = Math.max(rect.width, 1);
  const h = Math.max(rect.height, 1);
  const x = clamp01((event.clientX - rect.left) / w);
  const y = clamp01((event.clientY - rect.top) / h);
  const tMs = Math.max(0, performance.now() - sessionStartMs);

  let phase = "moved";
  if (event.type === "pointerdown") phase = "began";
  else if (event.type === "pointerup") phase = "ended";
  else if (event.type === "pointercancel") phase = "cancelled";

  const pointerId = event.pointerId;
  let pressure;
  if (typeof event.pressure === "number" && event.pressure > 0) {
    pressure = clamp01(event.pressure);
  }

  return { tMs, phase, pointerId, x, y, pressure };
}

function wirePlayground() {
  const pad = document.getElementById("touchpad");
  const log = document.getElementById("touchlog");
  if (!pad || !log) return;

  let sessionStart = performance.now();
  const buffer = [];
  const max = 12;

  const pushSample = (event) => {
    const s = sampleFromPointer(event, pad, sessionStart);
    buffer.push(s);
    while (buffer.length > max) buffer.shift();
    log.textContent = buffer.map((b) => JSON.stringify(b)).join("\n");
  };

  pad.addEventListener("pointerdown", (e) => {
    sessionStart = performance.now();
    pad.setPointerCapture(e.pointerId);
    pushSample(e);
  });
  pad.addEventListener("pointermove", (e) => {
    if (!pad.hasPointerCapture(e.pointerId)) return;
    pushSample(e);
  });
  const end = (e) => {
    if (pad.hasPointerCapture(e.pointerId)) {
      pushSample(e);
      pad.releasePointerCapture(e.pointerId);
    }
  };
  pad.addEventListener("pointerup", end);
  pad.addEventListener("pointercancel", end);
}

async function main() {
  const err = document.getElementById("data-error");
  let data = FALLBACK;
  try {
    const res = await fetch("/data.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = { ...FALLBACK, ...await res.json() };
  } catch (e) {
    if (err) {
      err.hidden = false;
      err.textContent = `Could not load data.json (${e instanceof Error ? e.message : "error"}). Showing embedded fallback.`;
    }
  }
  render(data);
  wirePlayground();
}

main();
