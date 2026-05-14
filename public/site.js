/**
 * TouchAI landing + playground.
 *
 * - Hydrates the page from public/data.json.
 * - Wires the playground end-to-end using the vendored Touch Language runtime
 *   (public/touchai/*), so the demo runs the same logic as @touchai/touch-runtime
 *   without any build step.
 */

import { touchSampleFromPointerEvent } from "/touchai/adapter-web.js";
import { segmentGestureFromPath } from "/touchai/segment.js";
import { evaluateProgram } from "/touchai/rules.js";
import { materializeHapticSemantic, WebHapticProgramPlayer } from "/touchai/haptics.js";
import { detectDeviceProfile, envelopeToJsonlLine, makeEnvelope, nextSessionId } from "/touchai/envelope.js";
import { TOUCHLANG_SPEC_VERSION } from "/touchai/spec.js";

const FALLBACK = {
  lastUpdated: "2026-05-14",
  specVersion: TOUCHLANG_SPEC_VERSION,
  headline: "TouchAI",
  subhead:
    "Touch as a structured language for AI on devices: normalized streams in, haptic programs out, versioned envelopes for training.",
  layers: [
    { id: "input", title: "Input", subtitle: "Touch Language", body: "Pointer and touch paths → TouchSample streams and GestureTokens." },
    { id: "output", title: "Output", subtitle: "Haptics", body: "Semantic haptics → neutral pulse programs → platform adapters." },
    { id: "infra", title: "Infrastructure", subtitle: "Programs & envelopes", body: "TouchProgram + TouchEventEnvelope JSONL across devices." },
  ],
  packages: [],
  next: [],
  links: { github: "https://github.com/EricSense/TouchAI" },
};

function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === "class") node.className = v;
    else if (k === "text") node.textContent = v;
    else node.setAttribute(k, String(v));
  }
  for (const c of children) node.appendChild(c);
  return node;
}

function renderSite(data) {
  document.title = `${data.headline} — touch language for AI on devices`;
  setText("spec-pill", `spec ${data.specVersion}`);
  setText("hero-title", data.headline);
  setText("hero-lead", data.subhead);

  const pills = document.getElementById("hero-pills");
  if (pills) pills.hidden = false;
  setText("pill-spec", data.specVersion);
  setText("pill-updated", data.lastUpdated);

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
      ...(data.packages || []).map((pkg) => {
        const badge = el("span", {
          class: `badge ${pkg.status === "shipped" ? "shipped" : "planned"}`,
          text: pkg.status || "planned",
        });
        const header = el("header", {}, [el("code", { text: pkg.name }), badge]);
        return el("article", { class: "pkg" }, [header, el("p", { text: pkg.summary || "" })]);
      }),
    );
  }

  const nextList = document.getElementById("next-list");
  if (nextList) {
    nextList.replaceChildren(...(data.next || []).map((t) => el("li", { text: t })));
  }

  const footLinks = document.getElementById("foot-links");
  if (footLinks && data.links) {
    const parts = [];
    if (data.links.github) parts.push(el("a", { href: data.links.github, text: "Repository" }));
    if (data.links.specVersionFile) parts.push(el("a", { href: data.links.specVersionFile, text: "Spec version (source)" }));
    const out = [];
    parts.forEach((a, i) => {
      if (i > 0) out.push(document.createTextNode(" · "));
      out.push(a);
    });
    footLinks.replaceChildren(...out);
  }
}

function setText(id, text) {
  const node = document.getElementById(id);
  if (node) node.textContent = text;
}

function setChip(id, label, value, live) {
  const node = document.getElementById(id);
  if (!node) return;
  node.textContent = `${label}: ${value}`;
  node.classList.toggle("live", Boolean(live));
}

class TrailRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.points = [];
    this.fadeUntil = 0;
    this.resize();
    window.addEventListener("resize", () => this.resize());
    requestAnimationFrame(() => this.tick());
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    this.canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;
    this.dpr = dpr;
    this.rect = rect;
  }

  push(sample) {
    this.points.push({ x: sample.x, y: sample.y, t: performance.now() });
    if (this.points.length > 200) this.points.shift();
  }

  flash() {
    this.fadeUntil = performance.now() + 600;
  }

  clear() {
    this.points = [];
  }

  tick() {
    const { ctx, dpr, rect } = this;
    if (!ctx || !rect) {
      requestAnimationFrame(() => this.tick());
      return;
    }
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.points.length >= 2) {
      const now = performance.now();
      for (let i = 1; i < this.points.length; i++) {
        const a = this.points[i - 1];
        const b = this.points[i];
        const age = (now - b.t) / 800;
        const alpha = Math.max(0, 1 - age);
        ctx.strokeStyle = `rgba(110, 231, 255, ${alpha.toFixed(3)})`;
        ctx.lineWidth = 4 * dpr;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(a.x * rect.width * dpr, a.y * rect.height * dpr);
        ctx.lineTo(b.x * rect.width * dpr, b.y * rect.height * dpr);
        ctx.stroke();
      }
    }
    if (this.fadeUntil > performance.now()) {
      const remaining = (this.fadeUntil - performance.now()) / 600;
      ctx.fillStyle = `rgba(167, 139, 250, ${(remaining * 0.18).toFixed(3)})`;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    requestAnimationFrame(() => this.tick());
  }
}

async function loadProgram() {
  try {
    const res = await fetch("/touchai/program.example.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return { rules: [] };
  }
}

function wirePlayground(program) {
  const pad = document.getElementById("touchpad");
  const trail = document.getElementById("trail");
  const log = document.getElementById("touchlog");
  const envLog = document.getElementById("envelope-log");
  const hapticStatus = document.getElementById("haptic-status");
  const copyBtn = document.getElementById("copy-envelope");
  if (!pad || !log || !envLog) return;

  const renderer = new TrailRenderer(trail);
  const haptics = new WebHapticProgramPlayer();
  const deviceProfile = detectDeviceProfile();

  if (hapticStatus) {
    hapticStatus.textContent = haptics.isSupported()
      ? "Vibration API: supported on this device"
      : "Vibration API: unavailable (desktop / iOS Safari). Semantic haptic still computed below.";
  }

  let sessionStart = performance.now();
  let stream = [];
  const tail = [];
  const maxTail = 12;

  const pushSample = (event) => {
    const s = touchSampleFromPointerEvent(event, pad, sessionStart);
    stream.push(s);
    tail.push(s);
    while (tail.length > maxTail) tail.shift();
    log.textContent = tail.map((b) => JSON.stringify(b)).join("\n");
    renderer.push(s);
  };

  const onStart = (e) => {
    sessionStart = performance.now();
    stream = [];
    tail.length = 0;
    renderer.clear();
    pad.classList.add("live");
    pad.setPointerCapture(e.pointerId);
    pushSample(e);
  };

  const onMove = (e) => {
    if (!pad.hasPointerCapture(e.pointerId)) return;
    pushSample(e);
  };

  const onEnd = (e) => {
    if (!pad.hasPointerCapture(e.pointerId)) return;
    pushSample(e);
    pad.releasePointerCapture(e.pointerId);
    pad.classList.remove("live");
    finishSession();
  };

  function finishSession() {
    const gesture = segmentGestureFromPath(stream);
    const rule = gesture ? evaluateProgram(program, gesture) : undefined;
    const intent = rule?.then?.intent;
    const hapticSemantic = rule?.then?.haptic;
    const hapticProgram = hapticSemantic ? materializeHapticSemantic(hapticSemantic) : undefined;

    if (gesture) {
      const description = describeGesture(gesture);
      setChip("chip-gesture", "gesture", description, true);
      renderer.flash();
    } else {
      setChip("chip-gesture", "gesture", "no match", false);
    }

    if (intent) {
      setChip("chip-intent", "intent", `${intent.intentId} · ${(intent.confidence * 100).toFixed(0)}%`, true);
    } else {
      setChip("chip-intent", "intent", "—", false);
    }

    if (hapticSemantic) {
      setChip("chip-haptic", "haptic", hapticSemantic.kind, true);
      if (hapticProgram && haptics.isSupported()) haptics.play(hapticProgram);
    } else {
      setChip("chip-haptic", "haptic", "—", false);
    }

    const envelope = makeEnvelope({
      sessionId: nextSessionId(),
      stream,
      gesture: gesture || undefined,
      intent,
      haptic: hapticSemantic,
      deviceProfile,
    });
    envLog.textContent = envelopeToJsonlLine(envelope).trimEnd();
  }

  pad.addEventListener("pointerdown", onStart);
  pad.addEventListener("pointermove", onMove);
  pad.addEventListener("pointerup", onEnd);
  pad.addEventListener("pointercancel", onEnd);

  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const text = envLog.textContent || "";
      if (!text || text.startsWith("Waiting")) return;
      try {
        await navigator.clipboard.writeText(text);
        const old = copyBtn.textContent;
        copyBtn.textContent = "Copied";
        setTimeout(() => (copyBtn.textContent = old), 1200);
      } catch {
        copyBtn.textContent = "Press ⌘C";
        setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
      }
    });
  }
}

function describeGesture(g) {
  if (g.kind === "tap") return `tap @ (${g.center.x.toFixed(2)}, ${g.center.y.toFixed(2)})`;
  if (g.kind === "long_press") return `long_press ${Math.round(g.durationMs)}ms`;
  if (g.kind === "swipe") {
    const angle = (Math.atan2(g.vector.dy, g.vector.dx) * 180) / Math.PI;
    let dir = "right";
    if (angle >= 45 && angle < 135) dir = "down";
    else if (angle >= -135 && angle < -45) dir = "up";
    else if (angle >= 135 || angle < -135) dir = "left";
    return `swipe ${dir}`;
  }
  if (g.kind === "pan") return "pan";
  return g.kind;
}

async function main() {
  const err = document.getElementById("data-error");
  let data = FALLBACK;
  try {
    const res = await fetch("/data.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = { ...FALLBACK, ...(await res.json()) };
  } catch (e) {
    if (err) {
      err.hidden = false;
      err.textContent = `Could not load data.json (${e instanceof Error ? e.message : "error"}). Showing embedded fallback.`;
    }
  }
  renderSite(data);
  const program = await loadProgram();
  wirePlayground(program);
}

main();
