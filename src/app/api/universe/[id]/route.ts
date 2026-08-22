import { NextResponse } from "next/server";
import { requireOwnedUniverse } from "@/lib/api";
import { serializeUniverse } from "@/lib/serialize";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const result = await requireOwnedUniverse(id);
  if (result.error) return result.error;
  return NextResponse.json(serializeUniverse(result.universe));
}
