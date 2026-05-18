import { describe, expect, it } from "vitest";
import { makeEnvelope, nextSessionId } from "./envelope-client.js";
import { envelopeToJsonlLine, parseJsonlLine } from "./jsonl-core.js";
import { TOUCHLANG_SPEC_VERSION } from "@touchai/touch-spec";

describe("envelope-client", () => {
  it("makeEnvelope sets specVersion and optional fields", () => {
    const env = makeEnvelope({
      sessionId: "s1",
      gesture: { kind: "tap", center: { x: 0.5, y: 0.5 }, pointerCount: 1, durationMs: 40 },
      intent: { intentId: "ack", confidence: 1 },
    });
    expect(env.specVersion).toBe(TOUCHLANG_SPEC_VERSION);
    expect(env.sessionId).toBe("s1");
    expect(env.gesture?.kind).toBe("tap");
  });

  it("nextSessionId returns unique ids", () => {
    const a = nextSessionId("test");
    const b = nextSessionId("test");
    expect(a).not.toBe(b);
    expect(a.startsWith("test-")).toBe(true);
  });

  it("round-trips through jsonl core", () => {
    const env = makeEnvelope({ sessionId: nextSessionId() });
    const line = envelopeToJsonlLine(env);
    const back = parseJsonlLine(line.trimEnd());
    expect(back.ok).toBe(true);
  });
});
