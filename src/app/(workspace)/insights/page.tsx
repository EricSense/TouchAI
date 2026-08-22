import Link from "next/link";
import { NODE_TYPES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { getUserUniverse } from "@/lib/universe";

export default async function InsightsPage() {
  const session = await requireSession();
  const universe = await getUserUniverse(session.userId);
  const [nodes, connections] = await Promise.all([
    prisma.node.findMany({ where: { universeId: universe.id } }),
    prisma.connection.findMany({ where: { universeId: universe.id } }),
  ]);

  const byType = Object.fromEntries(
    NODE_TYPES.map((type) => [type, nodes.filter((node) => node.type === type).length]),
  );

  const mostConnected = nodes
    .map((node) => ({
      node,
      count: connections.filter(
        (connection) =>
          connection.sourceNodeId === node.id || connection.targetNodeId === node.id,
      ).length,
    }))
    .sort((a, b) => b.count - a.count)[0];

  return (
    <main className="starfield min-h-screen px-8 py-10">
      <p className="text-[11px] tracking-[0.24em] text-gold uppercase">Universe insights</p>
      <h1 className="display mt-3 text-4xl font-semibold">{universe.name}</h1>
      <p className="mt-2 max-w-2xl text-muted">
        A simple reading of the graph: what exists, and what sits at the center.
      </p>

      <section className="panel mt-10 rounded-2xl p-6">
        <p className="text-[11px] tracking-[0.16em] text-muted uppercase">Total nodes</p>
        <p className="display mt-2 text-5xl">{nodes.length}</p>
      </section>

      <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {NODE_TYPES.map((type) => (
          <article key={type} className="panel rounded-2xl p-5">
            <p className="text-[11px] tracking-[0.16em] text-muted uppercase">{type}s</p>
            <p className="display mt-3 text-3xl">{byType[type]}</p>
          </article>
        ))}
      </section>

      <section className="panel mt-5 rounded-2xl p-6">
        <p className="text-[11px] tracking-[0.16em] text-muted uppercase">
          Most connected node
        </p>
        {mostConnected && mostConnected.count > 0 ? (
          <>
            <h2 className="display mt-3 text-3xl">{mostConnected.node.name}</h2>
            <p className="mt-2 text-muted">
              {mostConnected.node.type} · {mostConnected.count} connection
              {mostConnected.count === 1 ? "" : "s"}
            </p>
          </>
        ) : (
          <p className="mt-3 text-muted">
            Connect nodes to reveal the center of your ecosystem.
          </p>
        )}
        <Link href={`/universe/${universe.id}`} className="btn btn-ghost mt-6">
          Open the canvas
        </Link>
      </section>
    </main>
  );
}
