#!/usr/bin/env node
/**
 * Prepare @touchai/* package.json files for npm publish by replacing
 * workspace:* deps with semver ranges. Run before npm publish from each package dir.
 *
 * Usage: node scripts/prepare-publish.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const version = "0.2.0";

const packages = [
  "packages/touch-spec",
  "packages/touch-runtime",
  "packages/touch-dataset",
  "packages/touch-adapter-web",
];

for (const pkgDir of packages) {
  const path = join(root, pkgDir, "package.json");
  const pkg = JSON.parse(readFileSync(path, "utf8"));
  let changed = false;
  if (pkg.dependencies) {
    for (const [name, dep] of Object.entries(pkg.dependencies)) {
      if (dep === "workspace:*" && name.startsWith("@touchai/")) {
        pkg.dependencies[name] = `^${version}`;
        changed = true;
      }
    }
  }
  if (changed) {
    writeFileSync(path, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
    console.log(`Updated ${pkgDir}/package.json for publish`);
  }
}

console.log("Done. After publishing, restore workspace:* with git checkout -- packages/*/package.json");
