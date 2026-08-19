/**
 * TouchAI — bindings for AI models.
 * Plug any LLM into the touch layer: tools out, tool-calls in, results back.
 */

/**
 * @param {ReturnType<import('./index.js').createTouch>} touch
 * @param {'openai'|'anthropic'|'gemini'} provider
 */
export function forModel(touch, provider = 'openai') {
  const format = provider === 'claude' ? 'anthropic' : provider;

  return {
    provider: format,
    /** Tool schemas for this provider */
    tools: touch.tools(format === 'gemini' ? 'gemini' : format),
    /** System instructions: model is brain, TouchAI is hands */
    system: touch.systemPrompt(),
    toolChoice: format === 'anthropic' ? { type: 'auto' } : 'auto',
    /**
     * Execute tool calls from a model response.
     * Accepts OpenAI, Anthropic, or Gemini-shaped payloads (or a normalized list).
     */
    handle: (response) => handleToolCalls(touch, response, format),
    /** Build next-turn messages including tool results */
    nextMessages: (priorMessages, response, handled) =>
      appendToolResults(format, priorMessages, response, handled),
  };
}

/**
 * Normalize tool calls from common model response shapes.
 * @returns {{ id: string, name: string, args: object }[]}
 */
export function extractToolCalls(response, provider = 'openai') {
  if (!response) return [];

  // Already normalized
  if (Array.isArray(response) && response[0]?.name) {
    return response.map((c, i) => ({
      id: c.id ?? `call_${i}`,
      name: c.name,
      args: typeof c.args === 'string' ? safeJson(c.args) : (c.args ?? c.input ?? {}),
    }));
  }

  if (provider === 'anthropic' || response.content) {
    const blocks = response.content ?? [];
    return blocks
      .filter((b) => b.type === 'tool_use')
      .map((b) => ({
        id: b.id,
        name: b.name,
        args: b.input ?? {},
      }));
  }

  if (provider === 'gemini' || response.candidates || response.functionCalls) {
    const parts = response.candidates?.[0]?.content?.parts
      ?? response.functionCalls
      ?? [];
    return parts
      .filter((p) => p.functionCall || p.name)
      .map((p, i) => {
        const fc = p.functionCall ?? p;
        return {
          id: fc.id ?? `gemini_${i}`,
          name: fc.name,
          args: fc.args ?? {},
        };
      });
  }

  // OpenAI chat completions / responses API
  const choice = response.choices?.[0]?.message ?? response.message ?? response;
  const calls = choice.tool_calls ?? choice.function_call
    ? [choice.function_call].filter(Boolean)
    : [];

  if (choice.tool_calls) {
    return choice.tool_calls.map((c) => ({
      id: c.id,
      name: c.function?.name ?? c.name,
      args: safeJson(c.function?.arguments ?? c.arguments ?? '{}'),
    }));
  }

  if (calls.length && calls[0]) {
    const c = calls[0];
    return [{
      id: c.id ?? 'call_0',
      name: c.name,
      args: safeJson(c.arguments ?? '{}'),
    }];
  }

  return [];
}

/**
 * Run every tool call through TouchAI.act
 */
export async function handleToolCalls(touch, response, provider = 'openai') {
  const calls = extractToolCalls(response, provider);
  const results = [];

  for (const call of calls) {
    const entry = await touch.act({ name: call.name, args: call.args });
    results.push({
      toolCallId: call.id,
      name: call.name,
      args: call.args,
      entry,
      // Content string models expect as tool result
      content: JSON.stringify(
        entry.status === 'ok'
          ? { ok: true, result: entry.result }
          : { ok: false, error: entry.error, code: entry.code },
      ),
    });
  }

  return {
    calls,
    results,
    /** true if the model requested at least one action */
    touched: results.length > 0,
  };
}

/**
 * Append assistant + tool result messages for the next model turn.
 */
export function appendToolResults(provider, priorMessages = [], response, handled) {
  const messages = [...priorMessages];

  if (provider === 'anthropic') {
    if (response) messages.push({ role: 'assistant', content: response.content });
    for (const r of handled.results) {
      messages.push({
        role: 'user',
        content: [{ type: 'tool_result', tool_use_id: r.toolCallId, content: r.content }],
      });
    }
    return messages;
  }

  if (provider === 'gemini') {
    // Gemini: functionResponse parts
    const parts = handled.results.map((r) => ({
      functionResponse: {
        name: r.name,
        response: safeJson(r.content),
      },
    }));
    messages.push({ role: 'user', parts });
    return messages;
  }

  // OpenAI
  const assistant = response?.choices?.[0]?.message ?? response?.message ?? response;
  if (assistant) messages.push(assistant);
  for (const r of handled.results) {
    messages.push({
      role: 'tool',
      tool_call_id: r.toolCallId,
      content: r.content,
    });
  }
  return messages;
}

/**
 * One-shot helper: take a model response, execute touches, return payloads for the next call.
 */
export async function touchFromModel(touch, response, provider = 'openai') {
  const model = forModel(touch, provider);
  const handled = await model.handle(response);
  return {
    ...handled,
    tools: model.tools,
    system: model.system,
  };
}

function safeJson(value) {
  if (typeof value === 'object' && value != null) return value;
  try {
    return JSON.parse(value);
  } catch {
    return { raw: String(value) };
  }
}
