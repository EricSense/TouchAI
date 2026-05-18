import { describe, expect, it } from "vitest";
import { buildBridgeMessages } from "./prompt.js";
import { parseBridgeResponseText } from "./parse.js";

describe("buildBridgeMessages", () => {
  it("includes gesture and program rules", () => {
    const messages = buildBridgeMessages(
      {
        specVersion: "0.2.0",
        sessionId: "s1",
        gesture: { kind: "tap", center: { x: 0.5, y: 0.5 }, pointerCount: 1, durationMs: 40 },
      },
      {
        rules: [
          {
            id: "tap_ack",
            when: { match: { kind: "tap" } },
            then: { intent: { intentId: "ack", confidence: 1 }, haptic: { kind: "ack_light" } },
          },
        ],
      },
    );
    expect(messages).toHaveLength(2);
    expect(messages[0]?.role).toBe("system");
    expect(messages[1]?.content).toContain("tap_ack");
    expect(messages[1]?.content).toContain('"kind":"tap"');
  });
});

describe("parseBridgeResponseText", () => {
  it("parses raw JSON", () => {
    const result = parseBridgeResponseText(
      '{"intent":{"intentId":"confirm","confidence":0.9},"haptic":{"kind":"confirm_success"}}',
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.intent?.intentId).toBe("confirm");
      expect(result.value.haptic?.kind).toBe("confirm_success");
    }
  });

  it("parses fenced JSON", () => {
    const result = parseBridgeResponseText(
      'Here you go:\n```json\n{"intent":{"intentId":"ack","confidence":1}}\n```',
    );
    expect(result.ok).toBe(true);
  });

  it("rejects invalid schema", () => {
    const result = parseBridgeResponseText('{"intent":{"intentId":"","confidence":2}}');
    expect(result.ok).toBe(false);
  });
});
