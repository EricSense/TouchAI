import type {
  NodePriority,
  NodeStatus,
  NodeType,
  Relationship,
} from "@/lib/constants";

export type UniverseNode = {
  id: string;
  universeId: string;
  name: string;
  type: NodeType;
  description: string;
  status: NodeStatus;
  priority: NodePriority;
  tags: string[];
  notes: string;
  positionX: number;
  positionY: number;
  createdAt: string;
  updatedAt: string;
};

export type UniverseConnection = {
  id: string;
  universeId: string;
  sourceNodeId: string;
  targetNodeId: string;
  relationship: Relationship;
  createdAt: string;
};

export type UniverseActivity = {
  id: string;
  message: string;
  createdAt: string;
};

export type UniverseSnapshot = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  nodes: UniverseNode[];
  connections: UniverseConnection[];
  activities: UniverseActivity[];
};

export type DashboardData = {
  universe: { id: string; name: string };
  totals: {
    businesses: number;
    projects: number;
    ideas: number;
    activeGoals: number;
    nodes: number;
  };
  activities: UniverseActivity[];
};

export type InsightsData = {
  universe: { id: string; name: string };
  totalNodes: number;
  byType: Record<string, number>;
  mostConnected: { id: string; name: string; type: string; count: number } | null;
};

export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};
