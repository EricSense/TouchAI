# TouchAI

**TouchAI is a touch interaction language and runtime that lets app and AI developers turn gestures into structured intents and haptic responses—without rebuilding gesture detection on every platform.**

Built for **mobile/web app developers**, **AI/ML engineers** shipping on-device experiences, and **platform teams** who need one touch+haptic layer above iOS, Android, and the web.

---

## The problem

Touch is the primary interface on phones and tablets, but AI still mostly speaks **text and voice**.

Today, every app reinvents gesture handling with platform-specific APIs. There is no shared vocabulary for what a user *meant* with their fingers—and no standard way for AI to answer back with **haptics** instead of more pixels. That makes on-device AI feel disconnected from how people actually use hardware.

## The vision

When TouchAI is real:

- **One grammar** for touch input and haptic output across devices
- **Developers** write `TouchProgram` rules once; adapters map to UIKit, Android, and the web
- **Models** train on versioned `TouchEventEnvelope` JSONL—not raw coordinates
- **Users** get AI that understands physical intention and responds with *feel*, not only text

---

## Install

```bash
npm install @touchai/touch-runtime @touchai/touch-spec @touchai/touch-dataset
```

Published on npm at **v0.2.0** under the [`@touchai`](https://www.npmjs.com/org/touchai) scope. Works in **Node.js** and bundlers (Vite, esbuild, webpack). Requires Node 20+.

### Publish updates

```bash
npm login   # or set NPM_TOKEN
OTP=123456 pnpm run publish:npm   # when 2FA enabled
```

GitHub Actions workflow **Publish npm packages** uses the `NPM_TOKEN` repository secret.

---

## Quickstart (~10 lines)

```typescript
import { segmentGestureFromStream, evaluateProgram, materializeHapticSemantic } from "@touchai/touch-runtime";
import { makeEnvelope } from "@touchai/touch-dataset";
import type { TouchProgram, TouchSample } from "@touchai/touch-spec";

const program: TouchProgram = {
  rules: [{
    id: "swipe_confirm",
    when: { match: { kind: "swipe", direction: "right" } },
    then: {
      intent: { intentId: "confirm", confidence: 0.9 },
      haptic: { kind: "confirm_success" },
    },
  }],
};

const stream: TouchSample[] = [ /* pointer samples: tMs, phase, x, y, pointerId */ ];
const gesture = segmentGestureFromStream(stream);
const rule = gesture ? evaluateProgram(program, gesture) : undefined;
const hapticProgram = rule?.then.haptic
  ? materializeHapticSemantic(rule.then.haptic)
  : undefined;

const envelope = makeEnvelope({
  sessionId: "demo-1",
  stream,
  gesture: gesture ?? undefined,
  intent: rule?.then.intent,
  haptic: rule?.then.haptic,
});
```

Output is a **`TouchEventEnvelope`**—the wire format for logging, training data, and cross-device replay.

### Native (iOS / Android)

Swift and Kotlin adapters can emit the same envelope JSON as the TypeScript runtime:

```swift
// iOS — TouchAdapterIOS
let env = makeEnvelope(MakeEnvelopeInput(
    sessionId: nextSessionId(),
    stream: samples,
    gesture: GestureToken(kind: "tap", center: Point2D(x: 0.5, y: 0.5), pointerCount: 1, durationMs: 40),
    deviceProfile: detectDeviceProfile()
))
let line = try envelopeToJsonlLine(env)
```

```kotlin
// Android — com.touchai.touchadapter
val env = makeEnvelope(MakeEnvelopeInput(
    sessionId = nextSessionId(),
    stream = samples,
    deviceProfile = detectDeviceProfile(context),
))
val line = envelopeToJsonlLine(env)
```

---

## What's in the repo

| Package | Purpose |
|---------|---------|
| `@touchai/touch-spec` | Wire types + Zod schemas + JSON Schema export (v0.2.0) |
| `@touchai/touch-runtime` | Session normalization, gesture segmentation, rule engine, haptic materialization |
| `@touchai/touch-dataset` | JSONL helpers + envelope builders |
| `@touchai/touch-adapter-web` | Browser pointer → `TouchSample`, Vibration API haptics |
| `touch-adapter-ios` | UIKit mappers, haptic playback, **`TouchEventEnvelope` + JSONL export** |
| `touch-adapter-android` | MotionEvent mappers, haptic playback, **`TouchEventEnvelope` + JSONL export** |

**Live demo:** [touchai site](https://github.com/EricSense/TouchAI) — try the prototype playground (gesture pad → intent + JSONL envelope).

**Spec artifacts:** `public/schemas/*.schema.json` · [TouchEventEnvelope](public/schemas/TouchEventEnvelope.schema.json)

---

## Develop

```bash
pnpm install
pnpm run build:all   # compile packages + playground bundle
pnpm test            # 40+ tests
pnpm run publish:npm # after npm login — publishes all @touchai/* packages
```

Monorepo uses **pnpm workspaces**. Root `package.json` scripts orchestrate builds; Vercel deploys static `public/` (no install on CI).

---

## Roadmap

- [x] Touch Language spec + runtime + JSON Schema
- [x] Session normalization + multi-pointer gestures (pinch, two-finger swipe)
- [x] npm publish `@touchai/*` v0.2.0
- [x] Native envelope builders (Swift/Kotlin → JSONL)
- [ ] On-device gesture segmentation in native adapters
- [ ] `@touchai/ai-bridge` — envelope stream → LLM → intent + haptic
- [ ] Dataset ingest API with strict `specVersion` validation
- [ ] `.touch` DSL → `TouchProgram` compiler

---

## License

MIT · [EricSense/TouchAI](https://github.com/EricSense/TouchAI)
