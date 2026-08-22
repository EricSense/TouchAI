import { NextResponse } from "next/server";
import { RELATIONSHIPS } from "@/lib/constants";
import { requireOwnedUniverse } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { serializeConnection } from "@/lib/serialize";
import { recordActivity } from "@/lib/universe";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; connectionId: string }> },
) {
  const { id, connectionId } = await params;
  const result = await requireOwnedUniverse(id);
  if (result.error) return result.error;

  const existing = result.universe.connections.find(
    (connection) => connection.id === connectionId,
  );
  if (!existing) {
    return NextResponse.json({ error: "Connection not found." }, { status: 404 });
  }

  const body = await request.json();
  const relationship = String(body.relationship || existing.relationship);
  if (!RELATIONSHIPS.includes(relationship as (typeof RELATIONSHIPS)[number])) {
    return NextResponse.json({ error: "Invalid relationship." }, { status: 400 });
  }

  const connection = await prisma.connection.update({
    where: { id: connectionId },
    data: { relationship },
  });

  return NextResponse.json(serializeConnection(connection));
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; connectionId: string }> },
) {
  const { id, connectionId } = await params;
  const result = await requireOwnedUniverse(id);
  if (result.error) return result.error;

  const existing = result.universe.connections.find(
    (connection) => connection.id === connectionId,
  );
  if (!existing) {
    return NextResponse.json({ error: "Connection not found." }, { status: 404 });
  }

  const source = result.universe.nodes.find((node) => node.id === existing.sourceNodeId);
  const target = result.universe.nodes.find((node) => node.id === existing.targetNodeId);

  await prisma.connection.delete({ where: { id: connectionId } });
  await recordActivity(
    id,
    `Removed connection ${source?.name ?? "node"} → ${target?.name ?? "node"}`,
  );

  return NextResponse.json({ ok: true });
}
