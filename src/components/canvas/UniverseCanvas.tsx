"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  MarkerType,
} from "@xyflow/react";
import { CreateMenu } from "@/components/canvas/CreateMenu";
import { CreateNodeModal } from "@/components/canvas/CreateNodeModal";
import { NodeDetailsPanel } from "@/components/canvas/NodeDetailsPanel";
import { RelationshipDialog } from "@/components/canvas/RelationshipDialog";
import { UniverseNode, type UniverseFlowNode } from "@/components/canvas/UniverseNode";
import { NODE_META, type NodeType, type Relationship } from "@/lib/constants";
import type { UniverseConnection, UniverseNode as UniverseNodeData, UniverseSnapshot } from "@/lib/types";

const nodeTypes = { universe: UniverseNode };

function toFlowNodes(nodes: UniverseNodeData[]): UniverseFlowNode[] {
  return nodes.map((node) => ({
    id: node.id,
    type: "universe",
    position: { x: node.positionX, y: node.positionY },
    data: node,
  }));
}

function toFlowEdges(connections: UniverseConnection[]): Edge[] {
  return connections.map((connection) => ({
    id: connection.id,
    source: connection.sourceNodeId,
    target: connection.targetNodeId,
    label: connection.relationship,
    type: "smoothstep",
    markerEnd: { type: MarkerType.ArrowClosed, color: "rgba(201,169,106,0.7)", width: 16, height: 16 },
    style: { stroke: "rgba(201,169,106,0.4)", strokeWidth: 1.5 },
    labelStyle: { fill: "#cfc6b6", fontSize: 10, letterSpacing: "0.04em" },
    labelBgStyle: { fill: "#0b0d14", fillOpacity: 0.92 },
    labelBgPadding: [6, 4] as [number, number],
    labelBgBorderRadius: 6,
  }));
}

async function readError(response: Response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

function CanvasInner({ initial }: { initial: UniverseSnapshot }) {
  const { screenToFlowPosition } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState(toFlowNodes(initial.nodes));
  const [edges, setEdges, onEdgesChange] = useEdgesState(toFlowEdges(initial.connections));
  const [records, setRecords] = useState(initial.nodes);
  const [connections, setConnections] = useState(initial.connections);
  const [createType, setCreateType] = useState<NodeType | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingLink, setPendingLink] = useState<Connection | null>(null);
  const [saveState, setSaveState] = useState<"saved" | "saving">("saved");
  const saveTimer = useRef<number | null>(null);

  const selected = records.find((node) => node.id === selectedId) ?? null;

  const markSaving = useCallback(() => {
    setSaveState("saving");
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => setSaveState("saved"), 500);
  }, []);

  const onConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target) return;
    setPendingLink(connection);
  }, []);

  async function confirmConnection(relationship: Relationship) {
    if (!pendingLink?.source || !pendingLink.target) return;
    markSaving();
    const created = await readError(
      await fetch(`/api/universe/${initial.id}/connections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceNodeId: pendingLink.source,
          targetNodeId: pendingLink.target,
          relationship,
        }),
      }),
    );
    setConnections((current) =>
      current.some((item) => item.id === created.id) ? current : [...current, created],
    );
    setEdges((current) => {
      if (current.some((edge) => edge.id === created.id)) return current;
      return addEdge(toFlowEdges([created])[0], current);
    });
    setPendingLink(null);
  }

  async function createNode(input: {
    name: string;
    description: string;
    status: string;
    priority: string;
    tags: string;
  }) {
    if (!createType) return;
    const center = screenToFlowPosition({
      x: window.innerWidth / 2 + 40,
      y: window.innerHeight / 2,
    });
    const offset = records.length * 28;
    markSaving();
    const node = await readError(
      await fetch(`/api/universe/${initial.id}/nodes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...input,
          type: createType,
          positionX: center.x - 110 + offset,
          positionY: center.y - 40 + (offset % 160),
        }),
      }),
    );
    setRecords((current) => [...current, node]);
    setNodes((current) => [...current, ...toFlowNodes([node])]);
    setSelectedId(node.id);
    setCreateType(null);
  }

  async function saveNode(next: UniverseNodeData) {
    markSaving();
    const node = await readError(
      await fetch(`/api/universe/${initial.id}/nodes/${next.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: next.name,
          description: next.description,
          status: next.status,
          priority: next.priority,
          tags: next.tags,
          notes: next.notes,
        }),
      }),
    );
    setRecords((current) => current.map((item) => (item.id === node.id ? node : item)));
    setNodes((current) =>
      current.map((item) => (item.id === node.id ? { ...item, data: node } : item)),
    );
  }

  async function deleteNode(id: string) {
    markSaving();
    await readError(
      await fetch(`/api/universe/${initial.id}/nodes/${id}`, { method: "DELETE" }),
    );
    setRecords((current) => current.filter((node) => node.id !== id));
    setConnections((current) =>
      current.filter((connection) => connection.sourceNodeId !== id && connection.targetNodeId !== id),
    );
    setNodes((current) => current.filter((node) => node.id !== id));
    setEdges((current) => current.filter((edge) => edge.source !== id && edge.target !== id));
    setSelectedId(null);
  }

  const pendingNames = useMemo(() => {
    if (!pendingLink?.source || !pendingLink.target) return { source: "", target: "" };
    return {
      source: records.find((node) => node.id === pendingLink.source)?.name ?? "Node",
      target: records.find((node) => node.id === pendingLink.target)?.name ?? "Node",
    };
  }, [pendingLink, records]);

  return (
    <div className="relative h-screen overflow-hidden bg-[#07080c]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_480px_at_70%_10%,rgba(201,169,106,0.06),transparent_55%),radial-gradient(800px_500px_at_10%_90%,rgba(142,180,196,0.05),transparent_50%)]" />
      <header className="absolute top-0 right-0 left-0 z-10 flex items-center justify-between px-5 py-4">
        <div>
          <p className="text-[11px] tracking-[0.22em] text-gold uppercase">Universe</p>
          <h1 className="display text-xl">{initial.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-dim">
            {saveState === "saving" ? "Saving…" : "Saved"}
          </span>
          <CreateMenu onSelect={setCreateType} />
        </div>
      </header>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_event, node) => setSelectedId(node.id)}
        onPaneClick={() => setSelectedId(null)}
        onNodeDragStop={async (_event, node) => {
          markSaving();
          await fetch(`/api/universe/${initial.id}/nodes/${node.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ positionX: node.position.x, positionY: node.position.y }),
          });
          setRecords((current) =>
            current.map((item) =>
              item.id === node.id
                ? { ...item, positionX: node.position.x, positionY: node.position.y }
                : item,
            ),
          );
        }}
        onNodesDelete={(deleted) => {
          deleted.forEach((node) => {
            void deleteNode(node.id);
          });
        }}
        onEdgesDelete={(deleted) => {
          deleted.forEach(async (edge) => {
            markSaving();
            await fetch(`/api/universe/${initial.id}/connections/${edge.id}`, {
              method: "DELETE",
            });
            setConnections((current) => current.filter((item) => item.id !== edge.id));
          });
        }}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.28 }}
        minZoom={0.2}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        deleteKeyCode={["Backspace", "Delete"]}
        defaultEdgeOptions={{
          type: "smoothstep",
          markerEnd: { type: MarkerType.ArrowClosed, color: "rgba(201,169,106,0.7)" },
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={26}
          size={1.2}
          color="rgba(236,228,214,0.12)"
        />
        <Controls position="bottom-left" />
        <MiniMap
          position="bottom-right"
          pannable
          zoomable
          nodeColor={(node) => {
            const type = (node.data as UniverseNodeData | undefined)?.type;
            return type ? NODE_META[type].color : "#c9a96a";
          }}
          maskColor="rgba(7,8,12,0.72)"
        />
      </ReactFlow>

      {records.length === 0 ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="max-w-md text-center">
            <p className="display text-2xl">Your universe is unformed.</p>
            <p className="mt-3 text-sm leading-6 text-muted">
              Create a business, an idea, a skill, or a resource. Then connect them.
              The map is the product.
            </p>
          </div>
        </div>
      ) : null}

      {createType ? (
        <CreateNodeModal
          type={createType}
          onClose={() => setCreateType(null)}
          onCreate={createNode}
        />
      ) : null}

      {pendingLink ? (
        <RelationshipDialog
          sourceName={pendingNames.source}
          targetName={pendingNames.target}
          onCancel={() => setPendingLink(null)}
          onConfirm={(relationship) => void confirmConnection(relationship)}
        />
      ) : null}

      {selected ? (
        <NodeDetailsPanel
          key={selected.id}
          node={selected}
          nodes={records}
          connections={connections}
          onClose={() => setSelectedId(null)}
          onSave={saveNode}
          onDelete={deleteNode}
        />
      ) : null}
    </div>
  );
}

export function UniverseCanvas({ initial }: { initial: UniverseSnapshot }) {
  return (
    <ReactFlowProvider>
      <CanvasInner initial={initial} />
    </ReactFlowProvider>
  );
}
