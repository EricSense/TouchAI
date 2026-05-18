import { z } from "zod";

/** Single pointer sample in normalized device space (0–1), time-linear stream. */
export const TouchSampleSchema = z.object({
  tMs: z.number().nonnegative(),
  phase: z.enum(["began", "moved", "ended", "cancelled"]),
  pointerId: z.number().int().nonnegative(),
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  /** 0–1 when hardware reports force/pressure */
  pressure: z.number().min(0).max(1).optional(),
});

export type TouchSample = z.infer<typeof TouchSampleSchema>;

/** A segmented utterance: what the user “said” with touch after recognition. */
export const GestureTokenSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("tap"),
    center: z.object({ x: z.number(), y: z.number() }),
    pointerCount: z.number().int().min(1).max(10),
    durationMs: z.number().nonnegative(),
  }),
  z.object({
    kind: z.literal("long_press"),
    center: z.object({ x: z.number(), y: z.number() }),
    durationMs: z.number().positive(),
    pointerCount: z.number().int().min(1).max(10),
  }),
  z.object({
    kind: z.literal("swipe"),
    origin: z.object({ x: z.number(), y: z.number() }),
    vector: z.object({ dx: z.number(), dy: z.number() }),
    /** Unitless magnitude; compare within session */
    velocity: z.number().nonnegative(),
    pointerCount: z.number().int().min(1).max(10),
  }),
  z.object({
    kind: z.literal("pan"),
    delta: z.object({ dx: z.number(), dy: z.number() }),
    pointerCount: z.number().int().min(1).max(10),
  }),
  z.object({
    kind: z.literal("pinch"),
    center: z.object({ x: z.number(), y: z.number() }),
    /** endDistance / startDistance; <1 pinch in, >1 pinch out */
    scale: z.number().positive(),
    pointerCount: z.literal(2),
    durationMs: z.number().nonnegative(),
  }),
  z.object({
    kind: z.literal("two_finger_swipe"),
    origin: z.object({ x: z.number(), y: z.number() }),
    vector: z.object({ dx: z.number(), dy: z.number() }),
    /** Session-relative when segmentation used a SessionProfile */
    velocity: z.number().nonnegative(),
    pointerCount: z.literal(2),
  }),
]);

export type GestureToken = z.infer<typeof GestureTokenSchema>;
