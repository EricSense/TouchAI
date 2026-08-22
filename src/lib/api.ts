import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getOwnedUniverse } from "@/lib/universe";

export async function requireOwnedUniverse(universeId: string) {
  const session = await getSession();
  if (!session) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const universe = await getOwnedUniverse(session.userId, universeId);
  if (!universe) {
    return {
      error: NextResponse.json({ error: "Universe not found" }, { status: 404 }),
    };
  }

  return { session, universe };
}
