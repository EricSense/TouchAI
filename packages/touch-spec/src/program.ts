import { z } from "zod";
import { GestureTokenSchema } from "./touch-input.js";
import { HapticSemanticSchema } from "./haptic-output.js";
import { TouchIntentSchema } from "./intent.js";

/**
 * Touch Language *program* (infrastructure layer): declarative rules + hooks for model output.
 * v0 is JSON-safe; a textual DSL can compile down to this IR later.
 */
export const TouchRuleConditionSchema = z.object({
  gesture: GestureTokenSchema,
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

export const TouchProgramSchema = z.object({
  rules: z.array(TouchRuleSchema),
});

export type TouchProgram = z.infer<typeof TouchProgramSchema>;
