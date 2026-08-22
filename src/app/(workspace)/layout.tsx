import { AppShell } from "@/components/app/AppShell";
import { requireSession } from "@/lib/session";
import { getUserUniverse } from "@/lib/universe";

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  const universe = await getUserUniverse(session.userId);

  return (
    <AppShell universeId={universe.id} userName={session.name}>
      {children}
    </AppShell>
  );
}
