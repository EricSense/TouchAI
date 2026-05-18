/**
 * TouchAI playground — wires the gesture pad only.
 * All landing-page copy lives in index.html (no JS required for first paint).
 */

import {
  touchSampleFromPointerEvent,
  segmentGestureFromStream,
  computeSessionProfile,
  materializeHapticSemantic,
  WebHapticProgramPlayer,
  detectDeviceProfile,
  envelopeToJsonlLine,
  makeEnvelope,
  nextSessionId,
  resolveTouchBridge,
} from "/touchai/runtime.mjs";

async function loadProgram() {
  try {
    const res = await fetch("/touchai/program.example.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return { rules: [] };
  }
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
    this.ctx = canvas?.getContext("2d") ?? null;
    this.points = [];
    this.fadeUntil = 0;
    this.resize();
    window.addEventListener("resize", () => this.resize());
    requestAnimationFrame(() => this.tick());
  }

  resize() {
    if (!this.canvas?.parentElement) return;
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

function describeGesture(g) {
  if (g.kind === "tap") return `tap @ (${g.center.x.toFixed(2)}, ${g.center.y.toFixed(2)})`;
  if (g.kind === "long_press") return `long_press ${Math.round(g.durationMs)}ms`;
  if (g.kind === "pinch") {
    const dir = g.scale < 1 ? "in" : "out";
    return `pinch ${dir} ×${g.scale.toFixed(2)}`;
  }
  if (g.kind === "swipe" || g.kind === "two_finger_swipe") {
    const angle = (Math.atan2(g.vector.dy, g.vector.dx) * 180) / Math.PI;
    let dir = "right";
    if (angle >= 45 && angle < 135) dir = "down";
    else if (angle >= -135 && angle < -45) dir = "up";
    else if (angle >= 135 || angle < -135) dir = "left";
    const prefix = g.kind === "two_finger_swipe" ? "2f-swipe" : "swipe";
    return `${prefix} ${dir}`;
  }
  if (g.kind === "pan") return "pan";
  return g.kind;
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
      : "Vibration API: unavailable (desktop / iOS Safari). Semantic haptic still computed.";
  }

  let sessionStart = performance.now();
  let stream = [];
  const tail = [];
  const maxTail = 12;
  const activePointers = new Set();

  const pushSample = (event) => {
    const s = touchSampleFromPointerEvent(event, pad, sessionStart);
    stream.push(s);
    tail.push(s);
    while (tail.length > maxTail) tail.shift();
    log.textContent = tail.map((b) => JSON.stringify(b)).join("\n");
    renderer.push(s);
  };

  pad.addEventListener("pointerdown", (e) => {
    if (activePointers.size === 0) {
      sessionStart = performance.now();
      stream = [];
      tail.length = 0;
      renderer.clear();
      pad.classList.add("live");
    }
    activePointers.add(e.pointerId);
    pushSample(e);
  });

  pad.addEventListener("pointermove", (e) => {
    if (!activePointers.has(e.pointerId)) return;
    pushSample(e);
  });

  const onEnd = (e) => {
    if (!activePointers.has(e.pointerId)) return;
    pushSample(e);
    activePointers.delete(e.pointerId);
    if (activePointers.size === 0) {
      pad.classList.remove("live");
      finishSession();
    }
  };

  pad.addEventListener("pointerup", onEnd);
  pad.addEventListener("pointercancel", onEnd);

  function finishSession() {
    const sessionProfile = computeSessionProfile(stream);
    const gesture = segmentGestureFromStream(stream);
    const envelope = makeEnvelope({
      sessionId: nextSessionId(),
      stream,
      gesture: gesture || undefined,
      deviceProfile,
      sessionProfile,
    });

    resolveTouchBridge({ mode: "rules", envelope, program }).then((bridge) => {
      const intent = bridge.intent;
      const hapticSemantic = bridge.haptic;
      const hapticProgram = hapticSemantic ? materializeHapticSemantic(hapticSemantic) : undefined;

      if (gesture) {
        setChip("chip-gesture", "gesture", describeGesture(gesture), true);
        renderer.flash();
      } else {
        setChip("chip-gesture", "gesture", "no match", false);
      }

      setChip(
        "chip-session",
        "session",
        `v₀ ${sessionProfile.velocityBaseline.toExponential(2)} · p₀ ${sessionProfile.pressureBaseline.toFixed(2)} · n=${sessionProfile.sampleCount}`,
        true,
      );

      setChip(
        "chip-bridge",
        "bridge",
        bridge.ruleId ? `${bridge.source} · ${bridge.ruleId}` : bridge.source,
        bridge.source !== "none",
      );

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

      envLog.textContent = envelopeToJsonlLine(
        makeEnvelope({
          sessionId: envelope.sessionId,
          stream,
          gesture: gesture || undefined,
          intent,
          haptic: hapticSemantic,
          deviceProfile,
          sessionProfile,
        }),
      ).trimEnd();
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const text = envLog.textContent || "";
      if (!text || text.startsWith("Enable")) return;
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

function wireCopyInstall() {
  const btn = document.getElementById("copy-install");
  const cmd = document.getElementById("install-cmd");
  if (!btn || !cmd) return;
  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(cmd.textContent || "");
      const old = btn.textContent;
      btn.textContent = "Copied";
      setTimeout(() => (btn.textContent = old), 1200);
    } catch {
      btn.textContent = "Select & copy";
      setTimeout(() => (btn.textContent = "Copy"), 1500);
    }
  });
}

async function main() {
  wireCopyInstall();
  const program = await loadProgram();
  wirePlayground(program);
}

main();
