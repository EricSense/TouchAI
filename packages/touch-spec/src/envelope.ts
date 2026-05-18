import { z } from "zod";
import { TOUCHLANG_SPEC_VERSION } from "./version.js";
import { GestureTokenSchema, TouchSampleSchema } from "./touch-input.js";
import { HapticSemanticSchema } from "./haptic-output.js";
import { TouchIntentSchema } from "./intent.js";
import { SessionProfileSchema } from "./session.js";

/**
 * Wire envelope for logging, sync between device and model server, and reproducible datasets.
 * Everything TouchAI owns flows through a versioned envelope.
 */
export const TouchEventEnvelopeSchema = z.object({
  specVersion: z.literal(TOUCHLANG_SPEC_VERSION),
  sessionId: z.string().min(1),
  deviceProfile: z
    .object({
      vendor: z.string().optional(),
      model: z.string().optional(),
      os: z.string().optional(),
      maxPointers: z.number().int().positive().optional(),
    })
    .optional(),
  sessionProfile: SessionProfileSchema.optional(),
  stream: z.array(TouchSampleSchema).optional(),
  gesture: GestureTokenSchema.optional(),
  intent: TouchIntentSchema.optional(),
  haptic: HapticSemanticSchema.optional(),
});

export type TouchEventEnvelope = z.infer<typeof TouchEventEnvelopeSchema>;
