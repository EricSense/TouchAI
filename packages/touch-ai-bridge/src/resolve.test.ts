import { describe, expect, it, vi } from "vitest";
import { resolveTouchBridge } from "./resolve.js";
import { resolveWithRules } from "./providers/rules.js";
import { resolveWithLLM } from "./providers/llm.js";

const program = {
  rules: [
    {
      id: "swipe_confirm",
      when: { match: { kind: "swipe", direction: "right" as const } },
      then: {
        intent: { intentId: "confirm", confidence: 0.9 },
        haptic: { kind: "confirm_success" as const },
      },
    },
  ],
};

describe("resolveWithRules", () => {
  it("matches program rules on gesture", () => {
    const result = resolveWithRules(
      {
        specVersion: "0.2.0",
        sessionId: "s1",
        gesture: {
          kind: "swipe",
          origin: { x: 0.2, y: 0.5 },
          vector: { dx: 0.4, dy: 0 },
          velocity: 1.2,
          pointerCount: 1,
        },
      },
      program,
    );
    expect(result.source).toBe("rules");
    expect(result.ruleId).toBe("swipe_confirm");
    expect(result.intent?.intentId).toBe("confirm");
  });

  it("returns none when no gesture or rule", () => {
    const result = resolveWithRules({ specVersion: "0.2.0", sessionId: "s1" }, program);
    expect(result.source).toBe("none");
  });
});

describe("resolveWithLLM", () => {
  it("calls fetch and parses JSON response", async () => {
    const fetchFn = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                intent: { intentId: "explore", confidence: 0.8 },
                haptic: { kind: "understood" },
                reasoning: "ambiguous pan",
              }),
            },
          },
        ],
      }),
    })) as unknown as typeof fetch;

    const result = await resolveWithLLM(
      {
        specVersion: "0.2.0",
        sessionId: "s1",
        gesture: { kind: "pan", delta: { dx: 0.1, dy: 0 }, pointerCount: 1 },
      },
      program,
      { apiKey: "test-key" },
      fetchFn,
    );

    expect(result.source).toBe("llm");
    expect(result.intent?.intentId).toBe("explore");
    expect(result.haptic?.kind).toBe("understood");
    expect(fetchFn).toHaveBeenCalledOnce();
  });
});

describe("resolveTouchBridge", () => {
  it("rules-then-llm uses rules when matched", async () => {
    const fetchFn = vi.fn() as unknown as typeof fetch;
    const result = await resolveTouchBridge({
      mode: "rules-then-llm",
      program,
      llm: { apiKey: "k" },
      fetch: fetchFn,
      envelope: {
        specVersion: "0.2.0",
        sessionId: "s1",
        gesture: {
          kind: "swipe",
          origin: { x: 0.2, y: 0.5 },
          vector: { dx: 0.4, dy: 0 },
          velocity: 1.2,
          pointerCount: 1,
        },
      },
    });
    expect(result.source).toBe("rules");
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("rules-then-llm falls back to LLM", async () => {
    const fetchFn = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: '{"intent":{"intentId":"fallback","confidence":0.5}}' } }],
      }),
    })) as unknown as typeof fetch;

    const result = await resolveTouchBridge({
      mode: "rules-then-llm",
      program,
      llm: { apiKey: "k" },
      fetch: fetchFn,
      envelope: {
        specVersion: "0.2.0",
        sessionId: "s1",
        gesture: { kind: "pan", delta: { dx: 0.1, dy: 0 }, pointerCount: 1 },
      },
    });
    expect(result.source).toBe("llm");
    expect(result.intent?.intentId).toBe("fallback");
  });
});
