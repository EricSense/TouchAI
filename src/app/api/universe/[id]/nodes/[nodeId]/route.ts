import { NextResponse } from "next/server";
import { NODE_TYPES, PRIORITIES, STATUSES } from "@/lib/constants";
import { requireOwnedUniverse } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { serializeNode } from "@/lib/serialize";
import { recordActivity } from "@/lib/universe";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; nodeId: string }> },
) {
  const { id, nodeId } = await params;
  const result = await requireOwnedUniverse(id);
  if (result.error) return result.error;

  const existing = result.universe.nodes.find((node) => node.id === nodeId);
  if (!existing) {
    return NextResponse.json({ error: "Node not found." }, { status: 404 });
  }

  const body = await request.json();
  const data: Record<string, unknown> = {};

  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (!name) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }
    data.name = name;
  }
  if (body.type !== undefined) {
    if (!NODE_TYPES.includes(body.type)) {
      return NextResponse.json({ error: "Invalid node type." }, { status: 400 });
    }
    data.type = body.type;
  }
  if (body.description !== undefined) data.description = String(body.description);
  if (body.notes !== undefined) data.notes = String(body.notes);
  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    data.status = body.status;
  }
  if (body.priority !== undefined) {
    if (!PRIORITIES.includes(body.priority)) {
      return NextResponse.json({ error: "Invalid priority." }, { status: 400 });
    }
    data.priority = body.priority;
  }
  if (body.tags !== undefined) {
    const tags = Array.isArray(body.tags)
      ? body.tags.map((tag: unknown) => String(tag).trim()).filter(Boolean)
      : String(body.tags)
          .split(",")
          .map((tag: string) => tag.trim())
          .filter(Boolean);
    data.tags = tags.join(", ");
  }
  if (body.positionX !== undefined) data.positionX = Number(body.positionX);
  if (body.positionY !== undefined) data.positionY = Number(body.positionY);

  const node = await prisma.node.update({
    where: { id: nodeId },
    data,
  });

  const positionOnly =
    Object.keys(data).every((key) => key === "positionX" || key === "positionY") &&
    (data.positionX !== undefined || data.positionY !== undefined);

  if (!positionOnly) {
    await recordActivity(id, `Updated ${node.type} · ${node.name}`);
  } else {
    await prisma.universe.update({
      where: { id },
      data: { updatedAt: new Date() },
    });
  }

  return NextResponse.json(serializeNode(node));
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; nodeId: string }> },
) {
  const { id, nodeId } = await params;
  const result = await requireOwnedUniverse(id);
  if (result.error) return result.error;

  const existing = result.universe.nodes.find((node) => node.id === nodeId);
  if (!existing) {
    return NextResponse.json({ error: "Node not found." }, { status: 404 });
  }

  await prisma.node.delete({ where: { id: nodeId } });
  await recordActivity(id, `Deleted ${existing.type} · ${existing.name}`);
  return NextResponse.json({ ok: true });
}
