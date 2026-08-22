"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { NODE_META, NODE_TYPES, type NodeType } from "@/lib/constants";

export function CreateMenu({ onSelect }: { onSelect: (type: NodeType) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => setOpen((value) => !value)}
      >
        <Plus size={16} />
        Create
      </button>
      {open ? (
        <div className="panel absolute top-full left-0 z-20 mt-2 w-64 rounded-2xl p-2 shadow-2xl">
          {NODE_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-panel-2"
              onClick={() => {
                onSelect(type);
                setOpen(false);
              }}
            >
              <span
                className="mt-1 h-2.5 w-2.5 rounded-full"
                style={{ background: NODE_META[type].color }}
              />
              <span>
                <span className="block text-sm">+ {type}</span>
                <span className="block text-xs text-muted">
                  {NODE_META[type].description}
                </span>
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
