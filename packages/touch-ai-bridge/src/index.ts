export { resolveTouchBridge } from "./resolve.js";
export { resolveWithRules } from "./providers/rules.js";
export { resolveWithLLM } from "./providers/llm.js";
export { buildBridgeMessages, DEFAULT_BRIDGE_SYSTEM_PROMPT } from "./prompt.js";
export { parseBridgeResponseText, BridgeResponseSchema, type BridgeResponse } from "./parse.js";
export type {
  BridgeMode,
  BridgeSource,
  FetchLike,
  LLMBridgeConfig,
  ResolveTouchBridgeInput,
  ResolveTouchBridgeResult,
} from "./types.js";
