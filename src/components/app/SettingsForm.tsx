"use client";

import { useActionState } from "react";
import { updateSettings } from "@/actions/settings";
import type { FormState } from "@/lib/types";

export function SettingsForm({
  email,
  name,
  universeName,
}: {
  email: string;
  name: string;
  universeName: string;
}) {
  const [state, action, pending] = useActionState<FormState | undefined, FormData>(
    updateSettings,
    undefined,
  );

  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="field-label">Email</span>
        <input className="field opacity-70" value={email} disabled readOnly />
      </label>
      <label className="block">
        <span className="field-label">Name</span>
        <input className="field" name="name" defaultValue={name} required />
        {state?.fieldErrors?.name ? (
          <p className="mt-1 text-sm text-danger">{state.fieldErrors.name}</p>
        ) : null}
      </label>
      <label className="block">
        <span className="field-label">Universe name</span>
        <input
          className="field"
          name="universeName"
          defaultValue={universeName}
          required
        />
        {state?.fieldErrors?.universeName ? (
          <p className="mt-1 text-sm text-danger">{state.fieldErrors.universeName}</p>
        ) : null}
      </label>
      <button className="btn btn-primary" disabled={pending} type="submit">
        {pending ? "Saving…" : "Save changes"}
      </button>
      {state?.success ? (
        <p className="text-sm text-star">Saved. The universe has your new name.</p>
      ) : null}
    </form>
  );
}
