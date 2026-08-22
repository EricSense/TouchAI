import { NextResponse } from "next/server";
import { RELATIONSHIPS } from "@/lib/constants";
import { requireOwnedUniverse } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { serializeConnection } from "@/lib/serialize";
import { recordActivity } from "@/lib/universe";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const result = await requireOwnedUniverse(id);
  if (result.error) return result.error;

  const body = await request.json();
  const sourceNodeId = String(body.sourceNodeId || "");
  const targetNodeId = String(body.targetNodeId || "");
  const relationship = String(body.relationship || "Related to");

  if (sourceNodeId === targetNodeId) {
    return NextResponse.json(
      { error: "A node cannot connect to itself." },
      { status: 400 },
    );
  }
  if (!RELATIONSHIPS.includes(relationship as (typeof RELATIONSHIPS)[number])) {
    return NextResponse.json({ error: "Invalid relationship." }, { status: 400 });
  }

  const source = result.universe.nodes.find((node) => node.id === sourceNodeId);
  const target = result.universe.nodes.find((node) => node.id === targetNodeId);
  if (!source || !target) {
    return NextResponse.json({ error: "Both nodes must exist." }, { status: 400 });
  }

  const duplicate = result.universe.connections.find(
    (connection) =>
      connection.sourceNodeId === sourceNodeId &&
      connection.targetNodeId === targetNodeId,
  );
  if (duplicate) {
    return NextResponse.json(serializeConnection(duplicate));
  }

  const connection = await prisma.connection.create({
    data: {
      universeId: id,
      sourceNodeId,
      targetNodeId,
      relationship,
    },
  });

  await recordActivity(
    id,
    `Connected ${source.name} → ${target.name} (${relationship})`,
  );

  return NextResponse.json(serializeConnection(connection), { status: 201 });
}
