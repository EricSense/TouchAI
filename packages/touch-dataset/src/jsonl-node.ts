import type { TouchEventEnvelope } from "@touchai/touch-spec";
import { createWriteStream, type WriteStream } from "node:fs";
import { appendFile } from "node:fs/promises";
import { envelopeToJsonlLine } from "./jsonl-core.js";

export async function appendEnvelopeJsonlFile(
  filePath: string,
  envelope: TouchEventEnvelope,
): Promise<void> {
  await appendFile(filePath, envelopeToJsonlLine(envelope), "utf8");
}

export interface EnvelopeJsonlAppender {
  append(envelope: TouchEventEnvelope): void;
  end(): Promise<void>;
}

/** Streaming append for large local datasets (Node.js). */
export function createEnvelopeJsonlAppender(filePath: string): EnvelopeJsonlAppender {
  const stream: WriteStream = createWriteStream(filePath, { flags: "a" });
  return {
    append(envelope: TouchEventEnvelope) {
      stream.write(envelopeToJsonlLine(envelope));
    },
    end() {
      return new Promise((resolve, reject) => {
        stream.end((err) => (err ? reject(err) : resolve()));
      });
    },
  };
}
