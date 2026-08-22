import { spawnSync } from "node:child_process";

process.env.DATABASE_URL ||= "file:./dev.db";
process.env.AUTH_SECRET ||= "billion-universe-preview-secret";

const args = process.argv.slice(2);
const result = spawnSync("npx", ["prisma", ...args], {
  stdio: "inherit",
  env: process.env,
});

process.exit(result.status ?? 1);
