import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { zodToJsonSchema } from "zod-to-json-schema";
import { HapticProgramSchema } from "./haptic-output.js";
import { TouchEventEnvelopeSchema } from "./envelope.js";
import { TouchProgramSchema } from "./program.js";
import { SessionProfileSchema } from "./session.js";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "..", "dist", "schemas");

const exports = [
  ["TouchEventEnvelope", TouchEventEnvelopeSchema],
  ["HapticProgram", HapticProgramSchema],
  ["TouchProgram", TouchProgramSchema],
  ["SessionProfile", SessionProfileSchema],
] as const;

mkdirSync(outDir, { recursive: true });

for (const [name, schema] of exports) {
  const jsonSchema = zodToJsonSchema(schema, {
    name,
    $refStrategy: "none",
  });
  writeFileSync(join(outDir, `${name}.schema.json`), `${JSON.stringify(jsonSchema, null, 2)}\n`, "utf8");
}

console.log(`Wrote ${exports.length} JSON Schema files to ${outDir}`);
