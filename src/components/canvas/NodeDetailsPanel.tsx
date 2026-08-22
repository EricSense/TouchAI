"use client";

import { useState } from "react";
import { X } from "lucide-react";
import {
  NODE_META,
  PRIORITIES,
  STATUSES,
  type NodePriority,
  type NodeStatus,
} from "@/lib/constants";
import type { UniverseConnection, UniverseNode } from "@/lib/types";

export function NodeDetailsPanel({
  node,
  connections,
  nodes,
  onClose,
  onSave,
  onDelete,
}: {
  node: UniverseNode;
  connections: UniverseConnection[];
  nodes: UniverseNode[];
  onClose: () => void;
  onSave: (node: UniverseNode) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState(node);
  const [pending, setPending] = useState(false);
  const linked = connections
    .filter(
      (connection) =>
        connection.sourceNodeId === node.id || connection.targetNodeId === node.id,
    )
    .map((connection) => {
      const otherId =
        connection.sourceNodeId === node.id
          ? connection.targetNodeId
          : connection.sourceNodeId;
      const other = nodes.find((item) => item.id === otherId);
      return {
        id: connection.id,
        name: other?.name ?? "Unknown",
        relationship: connection.relationship,
      };
    });

  return (
    <aside className="scrollbar-thin absolute inset-y-0 right-0 z-20 w-[360px] overflow-y-auto border-l border-line bg-[#0d1017]/96 p-6 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] tracking-[0.22em] text-gold uppercase">
            Billion Universe
          </p>
          <p
            className="mt-3 text-[11px] tracking-[0.16em] uppercase"
            style={{ color: NODE_META[draft.type].color }}
          >
            Type: {draft.type}
          </p>
        </div>
        <button
          type="button"
          className="rounded-full border border-line p-2 text-muted hover:text-cream"
          onClick={onClose}
        >
          <X size={16} />
        </button>
      </div>

      <label className="mt-6 block">
        <span className="field-label">Name</span>
        <input
          className="field"
          value={draft.name}
          onChange={(event) => setDraft({ ...draft, name: event.target.value })}
        />
      </label>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="block">
          <span className="field-label">Status</span>
          <select
            className="field"
            value={draft.status}
            onChange={(event) =>
              setDraft({ ...draft, status: event.target.value as NodeStatus })
            }
          >
            {STATUSES.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="field-label">Priority</span>
          <select
            className="field"
            value={draft.priority}
            onChange={(event) =>
              setDraft({ ...draft, priority: event.target.value as NodePriority })
            }
          >
            {PRIORITIES.map((priority) => (
              <option key={priority}>{priority}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="mt-4 block">
        <span className="field-label">Description</span>
        <textarea
          className="field min-h-28 resize-none"
          value={draft.description}
          onChange={(event) => setDraft({ ...draft, description: event.target.value })}
        />
      </label>
      <label className="mt-4 block">
        <span className="field-label">Tags</span>
        <input
          className="field"
          value={draft.tags.join(", ")}
          onChange={(event) =>
            setDraft({
              ...draft,
              tags: event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean),
            })
          }
        />
      </label>
      <label className="mt-4 block">
        <span className="field-label">Notes</span>
        <textarea
          className="field min-h-24 resize-none"
          value={draft.notes}
          onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
        />
      </label>

      <div className="mt-6">
        <p className="field-label">Connections</p>
        {linked.length === 0 ? (
          <p className="text-sm text-muted">No connections yet. Drag a handle to another node.</p>
        ) : (
          <ul className="space-y-2">
            {linked.map((item) => (
              <li key={item.id} className="rounded-xl border border-line px-3 py-2 text-sm">
                <span className="text-cream">{item.name}</span>
                <span className="ml-2 text-xs text-gold">{item.relationship}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="mt-6 text-xs text-dim">
        Created {new Date(node.createdAt).toLocaleDateString()}
      </p>

      <div className="mt-6 flex gap-3">
        <button
          className="btn btn-primary flex-1"
          type="button"
          disabled={pending}
          onClick={async () => {
            setPending(true);
            await onSave(draft);
            setPending(false);
          }}
        >
          {pending ? "Saving…" : "Save"}
        </button>
        <button
          className="btn btn-ghost text-danger"
          type="button"
          onClick={() => void onDelete(node.id)}
        >
          Delete
        </button>
      </div>
    </aside>
  );
}
