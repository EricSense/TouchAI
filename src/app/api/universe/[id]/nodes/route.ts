import { NextResponse } from "next/server";
import { NODE_TYPES, PRIORITIES, STATUSES } from "@/lib/constants";
import { requireOwnedUniverse } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { serializeNode } from "@/lib/serialize";
import { recordActivity } from "@/lib/universe";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const result = await requireOwnedUniverse(id);
  if (result.error) return result.error;

  const body = await request.json();
  const name = String(body.name || "").trim();
  const type = String(body.type || "");
  const description = String(body.description || "").trim();
  const status = String(body.status || "Idea");
  const priority = String(body.priority || "Medium");
  const tags = Array.isArray(body.tags)
    ? body.tags.map((tag: unknown) => String(tag).trim()).filter(Boolean)
    : String(body.tags || "")
        .split(",")
        .map((tag: string) => tag.trim())
        .filter(Boolean);
  const notes = String(body.notes || "").trim();
  const positionX = Number(body.positionX ?? 0);
  const positionY = Number(body.positionY ?? 0);

  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  if (!NODE_TYPES.includes(type as (typeof NODE_TYPES)[number])) {
    return NextResponse.json({ error: "Invalid node type." }, { status: 400 });
  }
  if (!STATUSES.includes(status as (typeof STATUSES)[number])) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }
  if (!PRIORITIES.includes(priority as (typeof PRIORITIES)[number])) {
    return NextResponse.json({ error: "Invalid priority." }, { status: 400 });
  }

  const node = await prisma.node.create({
    data: {
      universeId: id,
      name,
      type,
      description,
      status,
      priority,
      tags: tags.join(", "),
      notes,
      positionX,
      positionY,
    },
  });

  await recordActivity(id, `Created ${type} · ${name}`);
  return NextResponse.json(serializeNode(node), { status: 201 });
}
