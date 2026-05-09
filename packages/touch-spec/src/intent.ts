import { z } from "zod";

/**
 * Structured intent the model (or hybrid rules+model) attaches to touch.
 * Keeps training/eval tractable: bounded vocabulary + opaque payload for app-specific slots.
 */
export const TouchIntentSchema = z.object({
  /** Stable intent id for metrics and fine-tuning corpora */
  intentId: z.string().min(1),
  confidence: z.number().min(0).max(1),
  /** Optional app-defined JSON-serializable slots */
  slots: z.record(z.unknown()).optional(),
});

export type TouchIntent = z.infer<typeof TouchIntentSchema>;
