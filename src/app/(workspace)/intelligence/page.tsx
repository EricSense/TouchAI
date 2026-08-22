import { IntelligencePanel } from "@/components/intelligence/IntelligencePanel";
import { openingInsight } from "@/lib/intelligence";
import { requireSession } from "@/lib/session";
import { getOwnedUniverseSnapshot, getUserUniverse } from "@/lib/universe";

export default async function IntelligencePage() {
  const session = await requireSession();
  const universe = await getUserUniverse(session.userId);
  const snapshot = await getOwnedUniverseSnapshot(session.userId, universe.id);
  const insight = openingInsight(snapshot?.nodes ?? [], snapshot?.connections ?? []);

  return (
    <main className="starfield min-h-screen px-8 py-10">
      <p className="text-[11px] tracking-[0.24em] text-gold uppercase">
        Universe Intelligence
      </p>
      <h1 className="display mt-3 text-4xl font-semibold">Your AI-powered strategist.</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Coming soon as a full model. For now, the strategist reads your current map
        with structured logic — enough to feel the future of the product.
      </p>
      <IntelligencePanel initialInsight={insight} />
    </main>
  );
}
