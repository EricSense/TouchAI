import { TOUCHLANG_SPEC_VERSION, type TouchEventEnvelope } from "@touchai/touch-spec";

let sessionCounter = 0;

export function nextSessionId(prefix = "web"): string {
  sessionCounter += 1;
  const stamp = Date.now().toString(36);
  return `${prefix}-${stamp}-${sessionCounter}`;
}

export interface MakeEnvelopeInput {
  sessionId: string;
  stream?: TouchEventEnvelope["stream"];
  gesture?: TouchEventEnvelope["gesture"];
  intent?: TouchEventEnvelope["intent"];
  haptic?: TouchEventEnvelope["haptic"];
  deviceProfile?: TouchEventEnvelope["deviceProfile"];
  sessionProfile?: TouchEventEnvelope["sessionProfile"];
}

/** Build a versioned TouchEventEnvelope (browser + Node safe). */
export function makeEnvelope(input: MakeEnvelopeInput): TouchEventEnvelope {
  const env: TouchEventEnvelope = {
    specVersion: TOUCHLANG_SPEC_VERSION,
    sessionId: input.sessionId,
  };
  if (input.deviceProfile) env.deviceProfile = input.deviceProfile;
  if (input.sessionProfile) env.sessionProfile = input.sessionProfile;
  if (input.stream && input.stream.length > 0) env.stream = input.stream;
  if (input.gesture) env.gesture = input.gesture;
  if (input.intent) env.intent = input.intent;
  if (input.haptic) env.haptic = input.haptic;
  return env;
}

interface TouchNavigator {
  userAgent?: string;
  vendor?: string;
  platform?: string;
  maxTouchPoints?: number;
}

export function detectDeviceProfile(): TouchEventEnvelope["deviceProfile"] | undefined {
  const nav = globalThis.navigator as TouchNavigator | undefined;
  if (!nav) return undefined;
  const ua = nav.userAgent || "";
  const maxPointers =
    typeof nav.maxTouchPoints === "number" && nav.maxTouchPoints > 0 ? nav.maxTouchPoints : 1;
  return {
    vendor: nav.vendor || undefined,
    model: ua.slice(0, 120) || undefined,
    os: typeof nav.platform === "string" ? nav.platform : undefined,
    maxPointers,
  };
}
