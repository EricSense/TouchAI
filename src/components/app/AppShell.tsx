"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Orbit,
  Settings,
  Sparkles,
  Telescope,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";

const nav = [
  { href: "/universe", label: "Universe", icon: Orbit, match: "universe" },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, match: "dashboard" },
  { href: "/insights", label: "Insights", icon: Telescope, match: "insights" },
  {
    href: "/intelligence",
    label: "Universe Intelligence",
    icon: Sparkles,
    match: "intelligence",
  },
  { href: "/settings", label: "Settings", icon: Settings, match: "settings" },
];

export function AppShell({
  children,
  universeId,
  userName,
}: {
  children: React.ReactNode;
  universeId: string;
  userName: string;
}) {
  const pathname = usePathname();
  const isCanvas = pathname.startsWith("/universe/");

  return (
    <div className="flex min-h-screen bg-void text-cream">
      <aside
        className={`sticky top-0 flex h-screen shrink-0 flex-col border-r border-line bg-void-2/90 ${
          isCanvas ? "w-[76px] px-3 py-5" : "w-[236px] px-4 py-5"
        }`}
      >
        <Link href="/dashboard" className="mb-8 px-1">
          <Logo compact={isCanvas} />
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {nav.map((item) => {
            const href = item.match === "universe" ? `/universe/${universeId}` : item.href;
            const active =
              item.match === "universe"
                ? pathname.startsWith("/universe")
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={href}
                title={item.label}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  active
                    ? "bg-gold-soft text-cream"
                    : "text-muted hover:bg-panel hover:text-cream"
                } ${isCanvas ? "justify-center px-0" : ""}`}
              >
                <Icon size={18} strokeWidth={1.6} />
                {!isCanvas ? <span>{item.label}</span> : null}
              </Link>
            );
          })}
        </nav>
        {!isCanvas ? (
          <p className="px-3 text-xs tracking-wide text-dim">{userName}</p>
        ) : null}
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
