"use client";

import { useState } from "react";
import { NODE_META, PRIORITIES, STATUSES, type NodeType } from "@/lib/constants";

export function CreateNodeModal({
  type,
  onClose,
  onCreate,
}: {
  type: NodeType;
  onClose: () => void;
  onCreate: (input: {
    name: string;
    description: string;
    status: string;
    priority: string;
    tags: string;
  }) => Promise<void>;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/55 px-4 backdrop-blur-sm">
      <form
        className="panel w-full max-w-lg rounded-3xl p-6"
        onSubmit={async (event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          setPending(true);
          setError("");
          try {
            await onCreate({
              name: String(form.get("name") || ""),
              description: String(form.get("description") || ""),
              status: String(form.get("status") || "Idea"),
              priority: String(form.get("priority") || "Medium"),
              tags: String(form.get("tags") || ""),
            });
          } catch (err) {
            setError(err instanceof Error ? err.message : "Could not create node.");
            setPending(false);
          }
        }}
      >
        <p className="text-[11px] tracking-[0.2em] uppercase" style={{ color: NODE_META[type].color }}>
          Create {type}
        </p>
        <h2 className="display mt-2 text-2xl">Place a new node in the universe</h2>
        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="field-label">Name</span>
            <input className="field" name="name" required placeholder={`${type} name`} />
          </label>
          <label className="block">
            <span className="field-label">Description</span>
            <textarea className="field min-h-24 resize-none" name="description" />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="field-label">Status</span>
              <select className="field" name="status" defaultValue="Idea">
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="field-label">Priority</span>
              <select className="field" name="priority" defaultValue="Medium">
                {PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="block">
            <span className="field-label">Tags</span>
            <input className="field" name="tags" placeholder="ai, healthcare, education" />
          </label>
        </div>
        {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
        <div className="mt-6 flex justify-end gap-3">
          <button className="btn btn-ghost" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" disabled={pending} type="submit">
            {pending ? "Creating…" : "Create Node"}
          </button>
        </div>
      </form>
    </div>
  );
}
