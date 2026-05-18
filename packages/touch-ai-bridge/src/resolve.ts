import { resolveWithRules } from "./providers/rules.js";
import { resolveWithLLM } from "./providers/llm.js";
import type { ResolveTouchBridgeInput, ResolveTouchBridgeResult } from "./types.js";

/**
 * Resolve intent + haptic from a TouchEventEnvelope using rules and/or an LLM.
 *
 * - `rules`: TouchProgram pattern matching only (offline, deterministic)
 * - `llm`: OpenAI-compatible chat API only
 * - `rules-then-llm`: rules first; LLM fallback when no rule matches
 */
export async function resolveTouchBridge(
  input: ResolveTouchBridgeInput,
): Promise<ResolveTouchBridgeResult> {
  const mode = input.mode ?? "rules";

  if (mode === "rules") {
    return resolveWithRules(input.envelope, input.program);
  }

  if (mode === "llm") {
    if (!input.llm) throw new Error("resolveTouchBridge: llm config required for mode=llm");
    return resolveWithLLM(input.envelope, input.program, input.llm, input.fetch);
  }

  const rulesResult = resolveWithRules(input.envelope, input.program);
  if (rulesResult.source === "rules" && (rulesResult.intent || rulesResult.haptic)) {
    return rulesResult;
  }

  if (!input.llm) throw new Error("resolveTouchBridge: llm config required for mode=rules-then-llm fallback");
  return resolveWithLLM(input.envelope, input.program, input.llm, input.fetch);
}
