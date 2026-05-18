import { describe, expect, it } from "vitest";
import { TOUCHLANG_SPEC_VERSION, type TouchEventEnvelope } from "@touchai/touch-spec";
import {
  appendEnvelopeJsonlFile,
  createEnvelopeJsonlAppender,
  envelopeToJsonlLine,
  parseJsonlLine,
  splitLines,
} from "./index.js";
import { mkdir, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

function sampleEnvelope(overrides: Partial<TouchEventEnvelope> = {}): TouchEventEnvelope {
  return {
    specVersion: TOUCHLANG_SPEC_VERSION,
    sessionId: "sess-1",
    gesture: {
      kind: "tap",
      center: { x: 0.5, y: 0.5 },
      pointerCount: 1,
      durationMs: 42,
    },
    ...overrides,
  };
}

describe("envelope JSONL", () => {
  it("round-trips through a line", () => {
    const env = sampleEnvelope();
    const line = envelopeToJsonlLine(env);
    expect(line.endsWith("\n")).toBe(true);
    const back = parseJsonlLine(line.trimEnd());
    expect(back.ok).toBe(true);
    if (back.ok) expect(back.value).toEqual(env);
  });

  it("rejects wrong spec version", () => {
    const bad = { ...sampleEnvelope(), specVersion: "0.0.1" };
    const line = `${JSON.stringify(bad)}\n`;
    const back = parseJsonlLine(line.trimEnd());
    expect(back.ok).toBe(false);
  });

  it("appendEnvelopeJsonlFile and stream appender", async () => {
    const dir = join(tmpdir(), `touchai-dataset-test-${Date.now()}`);
    await mkdir(dir, { recursive: true });
    const pathFile = join(dir, "out.jsonl");
    try {
      await appendEnvelopeJsonlFile(pathFile, sampleEnvelope({ sessionId: "a" }));
      const app = createEnvelopeJsonlAppender(pathFile);
      app.append(sampleEnvelope({ sessionId: "b" }));
      await app.end();
      const raw = await readFile(pathFile, "utf8");
      const lines = raw.trimEnd().split("\n");
      expect(lines).toHaveLength(2);
      expect(parseJsonlLine(lines[0]!).ok).toBe(true);
      expect(parseJsonlLine(lines[1]!).ok).toBe(true);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("splitLines handles chunked reads", () => {
    const carry = { buf: "" };
    const parts: string[] = [];
    for (const line of splitLines('{"a":1}\n{"b"', carry)) parts.push(line);
    expect(parts).toEqual(['{"a":1}']);
    for (const line of splitLines(':2}\n', carry)) parts.push(line);
    expect(parts).toEqual(['{"a":1}', '{"b":2}']);
  });
});
