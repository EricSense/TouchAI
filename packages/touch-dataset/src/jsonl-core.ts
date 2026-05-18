import { TouchEventEnvelopeSchema, type TouchEventEnvelope } from "@touchai/touch-spec";

/** One JSON object per line, UTF-8, for NDJSON / JSONL pipelines. */
export function envelopeToJsonlLine(envelope: TouchEventEnvelope): string {
  return `${JSON.stringify(envelope)}\n`;
}

export type ParseJsonlLineResult =
  | { ok: true; value: TouchEventEnvelope }
  | { ok: false; error: string; lineNumber?: number };

export function parseJsonlLine(line: string, lineNumber?: number): ParseJsonlLineResult {
  const trimmed = line.replace(/\r$/, "").trim();
  if (trimmed.length === 0) {
    return { ok: false, error: "empty_line", lineNumber };
  }
  let json: unknown;
  try {
    json = JSON.parse(trimmed) as unknown;
  } catch (e) {
    const message = e instanceof Error ? e.message : "invalid_json";
    return { ok: false, error: message, lineNumber };
  }
  const parsed = TouchEventEnvelopeSchema.safeParse(json);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.flatten().formErrors.join("; ") || "schema_mismatch",
      lineNumber,
    };
  }
  return { ok: true, value: parsed.data };
}

/** Split buffer by newlines; yields complete lines (without trailing `\n`). */
export function* splitLines(chunk: string, carry: { buf: string }): Generator<string> {
  carry.buf += chunk;
  let idx: number;
  while ((idx = carry.buf.indexOf("\n")) >= 0) {
    const line = carry.buf.slice(0, idx);
    carry.buf = carry.buf.slice(idx + 1);
    yield line;
  }
}

export function parseJsonl(text: string): ParseJsonlLineResult[] {
  const lines = text.split(/\n/).filter((l) => l.trim().length > 0);
  return lines.map((line, i) => parseJsonlLine(line, i + 1));
}
