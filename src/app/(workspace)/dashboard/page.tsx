import Link from "next/link";
import { Briefcase, Flag, Layers3, Lightbulb } from "lucide-react";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getUserUniverse } from "@/lib/universe";

function timeAgo(date: Date) {
  const delta = Date.now() - date.getTime();
  const minutes = Math.floor(delta / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default async function DashboardPage() {
  const session = await requireSession();
  const universe = await getUserUniverse(session.userId);
  const [nodes, activities] = await Promise.all([
    prisma.node.findMany({ where: { universeId: universe.id } }),
    prisma.activity.findMany({
      where: { universeId: universe.id },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const businesses = nodes.filter((node) => node.type === "Business").length;
  const projects = nodes.filter((node) => node.type === "Project").length;
  const ideas = nodes.filter((node) => node.type === "Idea").length;
  const activeGoals = nodes.filter(
    (node) =>
      node.type === "Goal" && (node.status === "Active" || node.status === "Building"),
  ).length;

  const stats = [
    { label: "Total businesses", value: businesses, icon: Briefcase },
    { label: "Total projects", value: projects, icon: Layers3 },
    { label: "Total ideas", value: ideas, icon: Lightbulb },
    { label: "Active goals", value: activeGoals, icon: Flag },
  ];

  return (
    <main className="starfield min-h-screen px-8 py-10">
      <p className="text-[11px] tracking-[0.24em] text-gold uppercase">Control center</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-4xl font-semibold">{universe.name}</h1>
          <p className="mt-2 text-muted">
            Everything you own, know, and are building — in one universe.
          </p>
        </div>
        <Link href={`/universe/${universe.id}`} className="btn btn-primary">
          Enter Your Universe
        </Link>
      </div>

      <section className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <article key={stat.label} className="panel rounded-2xl p-5">
              <div className="flex items-center justify-between text-muted">
                <p className="text-[11px] tracking-[0.16em] uppercase">{stat.label}</p>
                <Icon size={16} strokeWidth={1.6} />
              </div>
              <p className="display mt-4 text-4xl">{stat.value}</p>
            </article>
          );
        })}
      </section>

      <section className="panel mt-8 rounded-2xl p-6">
        <h2 className="display text-xl">Recent activity</h2>
        {activities.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            No movement yet. Enter your universe and create the first node.
          </p>
        ) : (
          <ul className="mt-5 space-y-3">
            {activities.map((activity) => (
              <li
                key={activity.id}
                className="flex items-center justify-between gap-4 border-b border-line pb-3 last:border-0 last:pb-0"
              >
                <span>{activity.message}</span>
                <span className="shrink-0 text-xs text-dim">
                  {timeAgo(activity.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
