import type { TouchEventEnvelope, TouchProgram } from "@touchai/touch-spec";
import { buildBridgeMessages } from "../prompt.js";
import { parseBridgeResponseText } from "../parse.js";
import type { FetchLike, LLMBridgeConfig, ResolveTouchBridgeResult } from "../types.js";

const DEFAULT_API_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4o-mini";

interface ChatCompletionResponse {
  choices?: Array<{ message?: { content?: string | null } }>;
}

export async function resolveWithLLM(
  envelope: TouchEventEnvelope,
  program: TouchProgram,
  config: LLMBridgeConfig,
  fetchFn: FetchLike = fetch,
): Promise<ResolveTouchBridgeResult> {
  const messages = buildBridgeMessages(envelope, program, config.systemPrompt);
  const controller = new AbortController();
  const timeoutMs = config.timeoutMs ?? 30_000;
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetchFn(config.apiUrl ?? DEFAULT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model ?? DEFAULT_MODEL,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages,
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`LLM request failed (${response.status}): ${detail.slice(0, 200)}`);
  }

  const body = (await response.json()) as ChatCompletionResponse;
  const content = body.choices?.[0]?.message?.content;
  if (!content) throw new Error("LLM response missing message content");

  const parsed = parseBridgeResponseText(content);
  if (!parsed.ok) throw new Error(`LLM JSON parse failed: ${parsed.error}`);

  return {
    source: "llm",
    intent: parsed.value.intent ?? envelope.intent,
    haptic: parsed.value.haptic ?? envelope.haptic,
    reasoning: parsed.value.reasoning,
  };
}
