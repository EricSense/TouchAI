import type { TouchEventEnvelope, TouchProgram } from "@touchai/touch-spec";
import { TOUCHLANG_SPEC_VERSION } from "@touchai/touch-spec";

const DEFAULT_SYSTEM = `You are TouchAI, a touch interaction interpreter.
Given a TouchEventEnvelope (gesture + optional session context), respond with JSON only:
{
  "intent": { "intentId": string, "confidence": number 0-1, "slots"?: object },
  "haptic": { "kind": "ack_light"|"ack_medium"|"ack_heavy"|"confirm_success"|"confirm_warning"|"confirm_error"|"understood"|"clarify" },
  "reasoning"?: string
}
Pick intentId from the TouchProgram rules when possible. Be concise.`;

export interface BridgeMessage {
  role: "system" | "user";
  content: string;
}

export function buildBridgeMessages(
  envelope: TouchEventEnvelope,
  program?: TouchProgram,
  systemPrompt = DEFAULT_SYSTEM,
): BridgeMessage[] {
  const programSummary =
    program?.rules
      .map((r) => `- ${r.id}: ${JSON.stringify(r.when)} → intent=${r.then.intent?.intentId ?? "—"}`)
      .join("\n") ?? "(no program rules)";

  const userContent = [
    `specVersion: ${envelope.specVersion ?? TOUCHLANG_SPEC_VERSION}`,
    `sessionId: ${envelope.sessionId}`,
    envelope.sessionProfile
      ? `sessionProfile: velocityBaseline=${envelope.sessionProfile.velocityBaseline}, pressureBaseline=${envelope.sessionProfile.pressureBaseline}, samples=${envelope.sessionProfile.sampleCount}`
      : null,
    envelope.gesture ? `gesture: ${JSON.stringify(envelope.gesture)}` : "gesture: (none)",
    envelope.intent ? `existingIntent: ${JSON.stringify(envelope.intent)}` : null,
    `\nTouchProgram rules:\n${programSummary}`,
    "\nRespond with JSON only.",
  ]
    .filter(Boolean)
    .join("\n");

  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: userContent },
  ];
}

export { DEFAULT_SYSTEM as DEFAULT_BRIDGE_SYSTEM_PROMPT };
