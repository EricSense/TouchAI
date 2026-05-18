#!/usr/bin/env node
/**
 * Bundle the playground runtime from workspace packages → public/touchai/runtime.mjs
 * and copy JSON Schema artifacts → public/schemas/.
 *
 * Run after `npm run build` (packages must be compiled first).
 */
import * as esbuild from "esbuild";
import { cpSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const entry = join(root, "scripts", "playground-entry.ts");
const outfile = join(root, "public", "touchai", "runtime.mjs");
const schemasSrc = join(root, "packages", "touch-spec", "dist", "schemas");
const schemasDest = join(root, "public", "schemas");

await esbuild.build({
  entryPoints: [entry],
  bundle: true,
  format: "esm",
  platform: "browser",
  target: ["es2020"],
  outfile,
  sourcemap: true,
  logLevel: "info",
  mainFields: ["module", "main"],
  conditions: ["import", "module", "default"],
});

if (existsSync(schemasSrc)) {
  mkdirSync(schemasDest, { recursive: true });
  for (const name of ["TouchEventEnvelope", "HapticProgram", "TouchProgram", "SessionProfile"]) {
    const file = `${name}.schema.json`;
    cpSync(join(schemasSrc, file), join(schemasDest, file));
  }
  console.log(`Copied JSON Schema files to ${schemasDest}`);
} else {
  console.warn("Schema dist not found — run npm run build -w @touchai/touch-spec first");
}

console.log(`Playground bundle → ${outfile}`);
