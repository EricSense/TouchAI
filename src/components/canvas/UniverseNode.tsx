import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { NODE_META, STATUS_TONE } from "@/lib/constants";
import type { UniverseNode as UniverseNodeData } from "@/lib/types";

export type UniverseFlowNode = Node<UniverseNodeData, "universe">;

export function UniverseNode({ data, selected }: NodeProps<UniverseFlowNode>) {
  const meta = NODE_META[data.type];

  return (
    <div className={`universe-node ${selected ? "selected" : ""}`}>
      <Handle type="target" position={Position.Left} />
      <Handle type="target" position={Position.Top} id="t" />
      <div className="flex items-center justify-between gap-3">
        <span
          className="text-[10px] tracking-[0.16em] uppercase"
          style={{ color: meta.color }}
        >
          {data.type}
        </span>
        <span className={`text-[10px] tracking-wide ${STATUS_TONE[data.status]}`}>
          {data.status}
        </span>
      </div>
      <p className="mt-2 text-[15px] leading-5 font-medium text-cream">{data.name}</p>
      {data.priority === "High" || data.priority === "Critical" ? (
        <p className="mt-2 text-[10px] tracking-[0.12em] text-gold uppercase">
          {data.priority} priority
        </p>
      ) : null}
      <Handle type="source" position={Position.Right} />
      <Handle type="source" position={Position.Bottom} id="b" />
    </div>
  );
}
