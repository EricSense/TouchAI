import type { SessionProfile, TouchSample } from "@touchai/touch-spec";

const DEFAULT_VELOCITY_BASELINE = 0.003;

/** Compute session baselines from a raw touch stream (before normalization). */
export function computeSessionProfile(stream: TouchSample[]): SessionProfile {
  let pressureBaseline = 0;
  const velocities: number[] = [];

  for (const s of stream) {
    if (s.pressure !== undefined && s.pressure > 0) {
      pressureBaseline = Math.max(pressureBaseline, s.pressure);
    }
  }

  const paths = splitStreamByPointer(stream);
  for (const path of paths.values()) {
    const sorted = [...path].sort((a, b) => a.tMs - b.tMs);
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    if (!first || !last || first.phase !== "began") continue;
    if (last.phase !== "ended" && last.phase !== "cancelled") continue;
    const dx = last.x - first.x;
    const dy = last.y - first.y;
    const travel = Math.hypot(dx, dy);
    const dt = Math.max(1, last.tMs - first.tMs);
    if (travel >= 0.06) velocities.push(travel / dt);
  }

  velocities.sort((a, b) => a - b);
  const velocityBaseline =
    velocities.length > 0
      ? velocities[Math.floor(velocities.length / 2)]!
      : DEFAULT_VELOCITY_BASELINE;

  return {
    sampleCount: stream.length,
    velocityBaseline,
    pressureBaseline: pressureBaseline > 0 ? pressureBaseline : 1,
  };
}

/** Scale pressure into session-relative 0–1 for segmentation and model input. */
export function normalizeSamples(stream: TouchSample[], profile: SessionProfile): TouchSample[] {
  const pb = Math.max(profile.pressureBaseline, 1e-6);
  return stream.map((s) => {
    if (s.pressure === undefined) return s;
    return {
      ...s,
      pressure: Math.min(1, Math.max(0, s.pressure / pb)),
    };
  });
}

/** Express raw swipe velocity relative to this session's baseline. */
export function sessionRelativeVelocity(rawVelocity: number, profile: SessionProfile): number {
  const base = profile.velocityBaseline > 0 ? profile.velocityBaseline : DEFAULT_VELOCITY_BASELINE;
  return rawVelocity / base;
}

export function splitStreamByPointer(stream: TouchSample[]): Map<number, TouchSample[]> {
  const paths = new Map<number, TouchSample[]>();
  for (const s of stream) {
    const list = paths.get(s.pointerId) ?? [];
    list.push(s);
    paths.set(s.pointerId, list);
  }
  return paths;
}
