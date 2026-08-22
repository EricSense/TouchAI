"use client";

import { RELATIONSHIPS, type Relationship } from "@/lib/constants";

export function RelationshipDialog({
  sourceName,
  targetName,
  onCancel,
  onConfirm,
}: {
  sourceName: string;
  targetName: string;
  onCancel: () => void;
  onConfirm: (relationship: Relationship) => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/55 px-4 backdrop-blur-sm">
      <form
        className="panel w-full max-w-md rounded-3xl p-6"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          onConfirm(String(form.get("relationship") || "Related to") as Relationship);
        }}
      >
        <p className="text-[11px] tracking-[0.2em] text-gold uppercase">Connection</p>
        <h2 className="display mt-2 text-2xl">
          {sourceName} → {targetName}
        </h2>
        <label className="mt-6 block">
          <span className="field-label">Relationship</span>
          <select className="field" name="relationship" defaultValue="Related to">
            {RELATIONSHIPS.map((relationship) => (
              <option key={relationship} value={relationship}>
                {relationship}
              </option>
            ))}
          </select>
        </label>
        <div className="mt-6 flex justify-end gap-3">
          <button className="btn btn-ghost" type="button" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-primary" type="submit">
            Connect
          </button>
        </div>
      </form>
    </div>
  );
}
