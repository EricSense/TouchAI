import { z } from "zod";

/** Platform-neutral haptic *program* the runtime maps to UIFeedbackGenerator, VibratorEffect, etc. */
export const HapticPulseSchema = z.object({
  /** Delay from previous pulse start (or program start for first). */
  delayMs: z.number().nonnegative(),
  /** 0–1 abstract intensity */
  intensity: z.number().min(0).max(1),
  /** 0–1 “sharpness” / transient vs sustained */
  sharpness: z.number().min(0).max(1),
  durationMs: z.number().positive(),
});

export type HapticPulse = z.infer<typeof HapticPulseSchema>;

export const HapticProgramSchema = z.object({
  id: z.string().min(1),
  pulses: z.array(HapticPulseSchema).min(1),
});

export type HapticProgram = z.infer<typeof HapticProgramSchema>;

/** Semantic presets the AI/runtime can use for conversational haptics. */
export const HapticSemanticSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("ack_light") }),
  z.object({ kind: z.literal("ack_medium") }),
  z.object({ kind: z.literal("ack_heavy") }),
  z.object({ kind: z.literal("confirm_success") }),
  z.object({ kind: z.literal("confirm_warning") }),
  z.object({ kind: z.literal("confirm_error") }),
  z.object({ kind: z.literal("understood") }),
  z.object({ kind: z.literal("clarify") }),
  z.object({ kind: z.literal("custom"), program: HapticProgramSchema }),
]);

export type HapticSemantic = z.infer<typeof HapticSemanticSchema>;
