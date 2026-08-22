import { copyFileSync, existsSync } from "node:fs";
import path from "node:path";

const PREVIEW_SECRET = "billion-universe-preview-secret";

function seedDatabasePath() {
  return path.join(process.cwd(), "prisma", "dev.db");
}

function resolveDatabaseUrl() {
  if (process.env.VERCEL) {
    const tmp = "/tmp/billion-universe.db";
    const seed = seedDatabasePath();
    if (!existsSync(tmp) && existsSync(seed)) {
      copyFileSync(seed, tmp);
    }
    return `file:${tmp}`;
  }

  return process.env.DATABASE_URL ?? "file:./dev.db";
}

if (!process.env.AUTH_SECRET) {
  process.env.AUTH_SECRET = PREVIEW_SECRET;
}

process.env.DATABASE_URL = resolveDatabaseUrl();
