import { notFound } from "next/navigation";
import { UniverseCanvas } from "@/components/canvas/UniverseCanvas";
import { requireSession } from "@/lib/session";
import { getOwnedUniverseSnapshot } from "@/lib/universe";

export default async function UniversePage({
  params,
}: PageProps<"/universe/[id]">) {
  const { id } = await params;
  const session = await requireSession();
  const universe = await getOwnedUniverseSnapshot(session.userId, id);
  if (!universe) notFound();

  return <UniverseCanvas initial={universe} />;
}
