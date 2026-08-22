export const NODE_TYPES = [
  "Business",
  "Project",
  "Idea",
  "Goal",
  "Skill",
  "Resource",
  "Person",
] as const;

export const STATUSES = [
  "Idea",
  "Planning",
  "Building",
  "Active",
  "Paused",
  "Completed",
  "Archived",
] as const;

export const PRIORITIES = ["Low", "Medium", "High", "Critical"] as const;

export const RELATIONSHIPS = [
  "Owns",
  "Supports",
  "Depends on",
  "Builds",
  "Funds",
  "Connects to",
  "Related to",
] as const;

export type NodeType = (typeof NODE_TYPES)[number];
export type NodeStatus = (typeof STATUSES)[number];
export type NodePriority = (typeof PRIORITIES)[number];
export type Relationship = (typeof RELATIONSHIPS)[number];

export const NODE_META: Record<
  NodeType,
  { label: string; color: string; soft: string; description: string }
> = {
  Business: {
    label: "Business",
    color: "#c9a96a",
    soft: "rgba(201, 169, 106, 0.16)",
    description: "A company, brand, or venture you own or are building.",
  },
  Project: {
    label: "Project",
    color: "#6b9bd1",
    soft: "rgba(107, 155, 209, 0.16)",
    description: "A body of work with a clear outcome.",
  },
  Idea: {
    label: "Idea",
    color: "#a78bce",
    soft: "rgba(167, 139, 206, 0.16)",
    description: "A spark you want to remember and connect.",
  },
  Goal: {
    label: "Goal",
    color: "#6fbf9a",
    soft: "rgba(111, 191, 154, 0.16)",
    description: "A destination your universe is moving toward.",
  },
  Skill: {
    label: "Skill",
    color: "#5eb3b3",
    soft: "rgba(94, 179, 179, 0.16)",
    description: "Capability you can apply across the universe.",
  },
  Resource: {
    label: "Resource",
    color: "#d4a06a",
    soft: "rgba(212, 160, 106, 0.16)",
    description: "Capital, tools, assets, or access you can deploy.",
  },
  Person: {
    label: "Person",
    color: "#d4899a",
    soft: "rgba(212, 137, 154, 0.16)",
    description: "A teammate, partner, advisor, or collaborator.",
  },
};

export const STATUS_TONE: Record<NodeStatus, string> = {
  Idea: "text-[#c4b5d8]",
  Planning: "text-[#9bb7d4]",
  Building: "text-[#c9a96a]",
  Active: "text-[#7dcaa6]",
  Paused: "text-[#c4b08a]",
  Completed: "text-[#8eb4c4]",
  Archived: "text-[#6b655b]",
};
