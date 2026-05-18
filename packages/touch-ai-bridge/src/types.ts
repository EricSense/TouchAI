import type { HapticSemantic, TouchEventEnvelope, TouchIntent, TouchProgram } from "@touchai/touch-spec";

export type BridgeMode = "rules" | "llm" | "rules-then-llm";

export type BridgeSource = "rules" | "llm" | "envelope" | "none";

export interface LLMBridgeConfig {
  /** OpenAI-compatible chat completions URL */
  apiUrl?: string;
  apiKey: string;
  model?: string;
  systemPrompt?: string;
  /** Request timeout in ms (default 30_000) */
  timeoutMs?: number;
}

export type FetchLike = typeof fetch;

export interface ResolveTouchBridgeInput {
  envelope: TouchEventEnvelope;
  program: TouchProgram;
  mode?: BridgeMode;
  llm?: LLMBridgeConfig;
  fetch?: FetchLike;
}

export interface ResolveTouchBridgeResult {
  source: BridgeSource;
  intent?: TouchIntent;
  haptic?: HapticSemantic;
  ruleId?: string;
  reasoning?: string;
}
