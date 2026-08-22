import { NextResponse } from "next/server";
import { answerQuestion, openingInsight } from "@/lib/intelligence";
import { getSession } from "@/lib/session";
import { getOwnedUniverseSnapshot, getUserUniverse } from "@/lib/universe";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const universe = await getUserUniverse(session.userId);
  const snapshot = await getOwnedUniverseSnapshot(session.userId, universe.id);
  if (!snapshot) {
    return NextResponse.json({ error: "Universe not found" }, { status: 404 });
  }

  return NextResponse.json({
    universeId: snapshot.id,
    insight: openingInsight(snapshot.nodes, snapshot.connections),
  });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const question = String(body.question || "").trim();
  if (!question) {
    return NextResponse.json({ error: "Ask a question." }, { status: 400 });
  }

  const universe = await getUserUniverse(session.userId);
  const snapshot = await getOwnedUniverseSnapshot(session.userId, universe.id);
  if (!snapshot) {
    return NextResponse.json({ error: "Universe not found" }, { status: 404 });
  }

  return NextResponse.json({
    answer: answerQuestion(question, snapshot.nodes, snapshot.connections),
  });
}
