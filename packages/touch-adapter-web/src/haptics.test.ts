import { describe, expect, it, vi } from "vitest";
import { WebHapticProgramPlayer } from "./haptics.js";

describe("WebHapticProgramPlayer", () => {
  it("reports unsupported when navigator lacks vibrate", () => {
    const player = new WebHapticProgramPlayer({});
    expect(player.isSupported()).toBe(false);
    expect(player.play({ id: "x", pulses: [{ delayMs: 0, intensity: 1, sharpness: 1, durationMs: 10 }] })).toBe(false);
  });

  it("builds a flat [on, off, ...] pattern from pulses", () => {
    const player = new WebHapticProgramPlayer({ vibrate: () => true });
    const pattern = player.buildPattern({
      id: "confirm_success",
      pulses: [
        { delayMs: 0, intensity: 0.5, sharpness: 1, durationMs: 20 },
        { delayMs: 60, intensity: 1, sharpness: 1, durationMs: 30 },
      ],
    });
    expect(pattern.length % 2).toBe(0);
    expect(pattern.length).toBeGreaterThan(0);
    expect(pattern.every((n) => n >= 0)).toBe(true);
  });

  it("delegates to navigator.vibrate when supported", () => {
    const vibrate = vi.fn(() => true);
    const player = new WebHapticProgramPlayer({ vibrate });
    const ok = player.play({
      id: "ack_light",
      pulses: [{ delayMs: 0, intensity: 0.4, sharpness: 0.9, durationMs: 12 }],
    });
    expect(ok).toBe(true);
    expect(vibrate).toHaveBeenCalledOnce();
  });
});
