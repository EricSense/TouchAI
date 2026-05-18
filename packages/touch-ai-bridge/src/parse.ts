import { z } from "zod";
import { HapticSemanticSchema, TouchIntentSchema } from "@touchai/touch-spec";

export const BridgeResponseSchema = z.object({
  intent: TouchIntentSchema.optional(),
  haptic: HapticSemanticSchema.optional(),
  reasoning: z.string().optional(),
});

export type BridgeResponse = z.infer<typeof BridgeResponseSchema>;

/** Extract and validate JSON from an LLM chat completion body (may be wrapped in markdown fences). */
export function parseBridgeResponseText(text: string):
  | { ok: true; value: BridgeResponse }
  | { ok: false; error: string } {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced?.[1] ?? trimmed).trim();

  let json: unknown;
  try {
    json = JSON.parse(candidate) as unknown;
  } catch (e) {
    const message = e instanceof Error ? e.message : "invalid_json";
    return { ok: false, error: message };
  }

  const parsed = BridgeResponseSchema.safeParse(json);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.flatten().formErrors.join("; ") || "schema_mismatch",
    };
  }
  return { ok: true, value: parsed.data };
}
