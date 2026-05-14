/**
 * Browser mirror of packages/touch-dataset/src/jsonl.ts (envelope side only).
 *
 * Produces JSONL lines that match TouchEventEnvelope shape and specVersion.
 */

import { TOUCHLANG_SPEC_VERSION } from "./spec.js";

let sessionCounter = 0;

export function nextSessionId() {
  sessionCounter += 1;
  const stamp = Date.now().toString(36);
  return `web-${stamp}-${sessionCounter}`;
}

export function makeEnvelope({ sessionId, stream, gesture, intent, haptic, deviceProfile }) {
  const env = {
    specVersion: TOUCHLANG_SPEC_VERSION,
    sessionId,
  };
  if (deviceProfile) env.deviceProfile = deviceProfile;
  if (stream && stream.length > 0) env.stream = stream;
  if (gesture) env.gesture = gesture;
  if (intent) env.intent = intent;
  if (haptic) env.haptic = haptic;
  return env;
}

export function envelopeToJsonlLine(envelope) {
  return `${JSON.stringify(envelope)}\n`;
}

export function detectDeviceProfile() {
  if (typeof navigator === "undefined") return undefined;
  const ua = navigator.userAgent || "";
  const maxPointers = typeof navigator.maxTouchPoints === "number" && navigator.maxTouchPoints > 0
    ? navigator.maxTouchPoints
    : 1;
  return {
    vendor: navigator.vendor || undefined,
    model: ua.slice(0, 120) || undefined,
    os: typeof navigator.platform === "string" ? navigator.platform : undefined,
    maxPointers,
  };
}
