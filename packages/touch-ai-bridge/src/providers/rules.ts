import type { TouchEventEnvelope, TouchProgram } from "@touchai/touch-spec";
import { evaluateProgram } from "@touchai/touch-runtime";
import type { ResolveTouchBridgeResult } from "../types.js";

export function resolveWithRules(
  envelope: TouchEventEnvelope,
  program: TouchProgram,
): ResolveTouchBridgeResult {
  if (envelope.gesture) {
    const rule = evaluateProgram(program, envelope.gesture);
    if (rule) {
      return {
        source: "rules",
        ruleId: rule.id,
        intent: rule.then.intent ?? envelope.intent,
        haptic: rule.then.haptic ?? envelope.haptic,
      };
    }
  }

  if (envelope.intent || envelope.haptic) {
    return {
      source: "envelope",
      intent: envelope.intent,
      haptic: envelope.haptic,
    };
  }

  return { source: "none" };
}
