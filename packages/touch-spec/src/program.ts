import { z } from "zod";
import { GestureTokenSchema } from "./touch-input.js";
import { HapticSemanticSchema } from "./haptic-output.js";
import { TouchIntentSchema } from "./intent.js";

export const SwipeDirectionSchema = z.enum(["up", "down", "left", "right"]);
export type SwipeDirection = z.infer<typeof SwipeDirectionSchema>;

/**
 * Qualitative pattern for rule matching (demo programs + future DSL output).
 * Exact `when.gesture` remains for deterministic test fixtures.
 */
export const TouchRuleMatchPatternSchema = z.object({
  kind: z.enum(["tap", "long_press", "swipe", "pan"]).optional(),
  pointerCount: z.number().int().min(1).max(10).optional(),
  region: z
    .object({
      x0: z.number().min(0).max(1),
      y0: z.number().min(0).max(1),
      x1: z.number().min(0).max(1),
      y1: z.number().min(0).max(1),
    })
    .optional(),
  minDurationMs: z.number().nonnegative().optional(),
  maxDurationMs: z.number().nonnegative().optional(),
  direction: SwipeDirectionSchema.optional(),
  minVelocity: z.number().nonnegative().optional(),
});

export type TouchRuleMatchPattern = z.infer<typeof TouchRuleMatchPatternSchema>;

export const TouchRuleConditionSchema = z
  .object({
    gesture: GestureTokenSchema.optional(),
    match: TouchRuleMatchPatternSchema.optional(),
  })
  .refine((w) => w.gesture !== undefined || w.match !== undefined, {
    message: "when must include gesture and/or match",
  });

export const TouchRuleActionSchema = z.object({
  intent: TouchIntentSchema.optional(),
  haptic: HapticSemanticSchema.optional(),
});

export const TouchRuleSchema = z.object({
  id: z.string().min(1),
  when: TouchRuleConditionSchema,
  then: TouchRuleActionSchema,
});

export type TouchRule = z.infer<typeof TouchRuleSchema>;

export const TouchProgramMetaSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  specVersion: z.string().optional(),
});

export const TouchProgramSchema = z.object({
  _meta: TouchProgramMetaSchema.optional(),
  rules: z.array(TouchRuleSchema),
});

export type TouchProgram = z.infer<typeof TouchProgramSchema>;
