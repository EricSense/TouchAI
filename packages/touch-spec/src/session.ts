import { z } from "zod";

/** Per-session baselines so velocity/pressure compare within a session, not across devices. */
export const SessionProfileSchema = z.object({
  sampleCount: z.number().int().nonnegative(),
  /** Typical swipe velocity in this session (median of completed swipes, or fallback). */
  velocityBaseline: z.number().nonnegative(),
  /** Max observed pressure in session, lower-bounded at 1 for division safety. */
  pressureBaseline: z.number().positive(),
});

export type SessionProfile = z.infer<typeof SessionProfileSchema>;
