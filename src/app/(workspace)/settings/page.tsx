import { logout } from "@/actions/auth";
import { SettingsForm } from "@/components/app/SettingsForm";
import { requireSession } from "@/lib/session";
import { getUserUniverse } from "@/lib/universe";

export default async function SettingsPage() {
  const session = await requireSession();
  const universe = await getUserUniverse(session.userId);

  return (
    <main className="starfield min-h-screen px-8 py-10">
      <p className="text-[11px] tracking-[0.24em] text-gold uppercase">Settings</p>
      <h1 className="display mt-3 text-4xl font-semibold">Your universe, your terms.</h1>
      <p className="mt-2 max-w-xl text-muted">
        Each account holds a private universe. Nothing here is shared.
      </p>

      <div className="panel mt-10 max-w-xl rounded-2xl p-6">
        <SettingsForm
          email={session.email}
          name={session.name}
          universeName={universe.name}
        />
        <form action={logout} className="mt-8 border-t border-line pt-6">
          <button className="btn btn-ghost" type="submit">
            Log out
          </button>
        </form>
      </div>
    </main>
  );
}
