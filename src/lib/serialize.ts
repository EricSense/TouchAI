import type { Activity, Connection, Node, Universe } from "@prisma/client";
import type { NodePriority, NodeStatus, NodeType, Relationship } from "@/lib/constants";
import type { UniverseConnection, UniverseNode, UniverseSnapshot } from "@/lib/types";

export function parseTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function serializeNode(node: Node): UniverseNode {
  return {
    id: node.id,
    universeId: node.universeId,
    name: node.name,
    type: node.type as NodeType,
    description: node.description,
    status: node.status as NodeStatus,
    priority: node.priority as NodePriority,
    tags: parseTags(node.tags),
    notes: node.notes,
    positionX: node.positionX,
    positionY: node.positionY,
    createdAt: node.createdAt.toISOString(),
    updatedAt: node.updatedAt.toISOString(),
  };
}

export function serializeConnection(connection: Connection): UniverseConnection {
  return {
    id: connection.id,
    universeId: connection.universeId,
    sourceNodeId: connection.sourceNodeId,
    targetNodeId: connection.targetNodeId,
    relationship: connection.relationship as Relationship,
    createdAt: connection.createdAt.toISOString(),
  };
}

export function serializeUniverse(
  universe: Universe & {
    nodes: Node[];
    connections: Connection[];
    activities: Activity[];
  },
): UniverseSnapshot {
  return {
    id: universe.id,
    name: universe.name,
    createdAt: universe.createdAt.toISOString(),
    updatedAt: universe.updatedAt.toISOString(),
    nodes: universe.nodes.map(serializeNode),
    connections: universe.connections.map(serializeConnection),
    activities: universe.activities.map((activity) => ({
      id: activity.id,
      message: activity.message,
      createdAt: activity.createdAt.toISOString(),
    })),
  };
}
