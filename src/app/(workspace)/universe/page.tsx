import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { getUserUniverse } from "@/lib/universe";

export default async function UniverseIndexPage() {
  const session = await requireSession();
  const universe = await getUserUniverse(session.userId);
  redirect(`/universe/${universe.id}`);
}
