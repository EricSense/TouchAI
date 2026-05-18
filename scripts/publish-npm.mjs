#!/usr/bin/env node
/**
 * Build and publish all @touchai/* packages to npm in dependency order.
 *
 * Prerequisites:
 *   npm login   OR   NPM_TOKEN=npm_xxx node scripts/publish-npm.mjs
 *   OTP=123456 pnpm run publish:npm   (when 2FA is enabled on your npm account)
 *
 * Publishes: touch-spec → touch-runtime → touch-dataset → touch-adapter-web
 * Restores workspace:* in package.json when done.
 */
import { execSync } from "node:child_process";
import { writeFileSync, unlinkSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const npmrcPath = join(root, ".npmrc");
const hadNpmrc = existsSync(npmrcPath);

function run(cmd, cwd = root) {
  console.log(`\n→ ${cmd}`);
  execSync(cmd, { cwd, stdio: "inherit", env: process.env });
}

function setupAuth() {
  if (process.env.NPM_TOKEN) {
    const line = `//registry.npmjs.org/:_authToken=${process.env.NPM_TOKEN}\n`;
    writeFileSync(npmrcPath, line, "utf8");
    console.log("Using NPM_TOKEN from environment");
    return true;
  }
  try {
    execSync("npm whoami", { stdio: "pipe", env: process.env });
    console.log("Using existing npm login session");
    return true;
  } catch {
    return false;
  }
}

function cleanup() {
  if (!hadNpmrc && existsSync(npmrcPath)) {
    unlinkSync(npmrcPath);
  }
  run("git checkout -- packages/touch-spec/package.json packages/touch-runtime/package.json packages/touch-dataset/package.json packages/touch-adapter-web/package.json");
}

const publishOrder = [
  "packages/touch-spec",
  "packages/touch-runtime",
  "packages/touch-dataset",
  "packages/touch-adapter-web",
];

try {
  if (!setupAuth()) {
    console.error("\n❌ Not logged in to npm. Run:  npm login");
    console.error("   Or:  NPM_TOKEN=npm_xxx node scripts/publish-npm.mjs\n");
    process.exit(1);
  }

  run("node scripts/prepare-publish.mjs");
  run("pnpm run build -w @touchai/touch-spec");
  run("pnpm run build -w @touchai/touch-runtime");
  run("pnpm run build -w @touchai/touch-dataset");
  run("pnpm run build -w @touchai/touch-adapter-web");

  const otp = process.env.NPM_OTP || process.env.OTP;
  const otpFlag = otp ? ` --otp=${otp}` : "";

  for (const pkgDir of publishOrder) {
    run(`npm publish --access public${otpFlag}`, join(root, pkgDir));
  }

  console.log("\n✅ Published @touchai/* v0.2.0 to npm\n");
} catch (e) {
  console.error("\n❌ Publish failed.\n");
  process.exit(typeof e.status === "number" ? e.status : 1);
} finally {
  cleanup();
}
