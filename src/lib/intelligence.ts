import type { UniverseConnection, UniverseNode } from "@/lib/types";

function countByType(nodes: UniverseNode[]) {
  return nodes.reduce<Record<string, number>>((acc, node) => {
    acc[node.type] = (acc[node.type] || 0) + 1;
    return acc;
  }, {});
}

function connectionCount(nodeId: string, connections: UniverseConnection[]) {
  return connections.filter(
    (connection) =>
      connection.sourceNodeId === nodeId || connection.targetNodeId === nodeId,
  ).length;
}

function mostConnected(nodes: UniverseNode[], connections: UniverseConnection[]) {
  if (nodes.length === 0) return null;
  return [...nodes]
    .map((node) => ({ node, count: connectionCount(node.id, connections) }))
    .sort((a, b) => b.count - a.count)[0];
}

function corpus(nodes: UniverseNode[]) {
  return nodes
    .map((node) =>
      [node.name, node.description, node.notes, node.tags.join(" ")].join(" "),
    )
    .join(" ")
    .toLowerCase();
}

function mentions(text: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(text));
}

export function analyzeUniverse(nodes: UniverseNode[], connections: UniverseConnection[]) {
  const byType = countByType(nodes);
  const hub = mostConnected(nodes, connections);
  const isolated = nodes.filter((node) => connectionCount(node.id, connections) === 0);
  const text = corpus(nodes);
  const businesses = nodes.filter((node) => node.type === "Business");
  const resources = nodes.filter((node) => node.type === "Resource");
  const goals = nodes.filter((node) => node.type === "Goal");
  const projects = nodes.filter((node) => node.type === "Project");
  const ideas = nodes.filter((node) => node.type === "Idea");
  const skills = nodes.filter((node) => node.type === "Skill");

  const hasAI = mentions(text, [
    /\bai\b/,
    /artificial intelligence/,
    /machine learning/,
    /\bml\b/,
    /intelligence/,
  ]);
  const hasHealth = mentions(text, [
    /health/,
    /medical/,
    /clinic/,
    /care/,
    /wellness/,
  ]);
  const hasEducation = mentions(text, [/educat/, /learn/, /school/, /course/, /student/]);

  return {
    byType,
    hub,
    isolated,
    businesses,
    resources,
    goals,
    projects,
    ideas,
    skills,
    hasAI,
    hasHealth,
    hasEducation,
    text,
  };
}

export function openingInsight(nodes: UniverseNode[], connections: UniverseConnection[]) {
  if (nodes.length === 0) {
    return "Your universe is still unformed. Add a business, an idea, a skill, and a resource — then connect them. I will start seeing the shape of what you should build next.";
  }

  const analysis = analyzeUniverse(nodes, connections);

  if (analysis.hasAI && analysis.hasHealth) {
    const skill = analysis.skills.find((node) => /ai|intelligence/i.test(node.name))?.name;
    const project = analysis.projects.find((node) =>
      /augment|health|intelligence|hai/i.test(`${node.name} ${node.description}`),
    )?.name;
    return `I noticed that your AI skills${skill ? ` (${skill})` : ""}, healthcare interests, and ${project ?? "connected work"} are highly connected.\n\nPotential opportunity:\nCreate an AI-powered healthcare education platform.`;
  }

  if (analysis.hasAI && analysis.hasEducation) {
    return "Your AI capability and education-related work already share gravity. The highest-leverage next move is a product that teaches through intelligence — a platform, not another isolated course.";
  }

  if (analysis.businesses.length > 0 && analysis.resources.length === 0) {
    return `${analysis.businesses[0].name} is in motion, but the universe has no resources attached to it. Map capital, tools, distribution, and people before you add more ideas. Missing resources are usually the real constraint.`;
  }

  if (analysis.ideas.length > 3 && analysis.projects.length === 0) {
    return `You have ${analysis.ideas.length} ideas and no projects converting them. Pick the idea closest to an existing skill or business and promote it into a project this week.`;
  }

  if (analysis.goals.length > 0 && analysis.projects.length === 0) {
    return `A goal without a project is a wish. ${analysis.goals[0].name} needs a supporting project, then a skill or resource that makes it inevitable.`;
  }

  if (analysis.isolated.length > 2) {
    return `${analysis.isolated.length} nodes are still floating unconnected. Isolated ideas hide opportunities. Start by linking ${analysis.isolated[0].name} to the nearest business, skill, or person.`;
  }

  if (analysis.hub && analysis.hub.count > 0) {
    return `${analysis.hub.node.name} is the center of your ecosystem with ${analysis.hub.count} connection${analysis.hub.count === 1 ? "" : "s"}. Treat it as the sun: new work should either strengthen it or clearly orbit it.`;
  }

  return "The map is forming. Add one more connection between a skill and a business, then ask me what you should build next. Universe Intelligence gets sharper as the graph densifies.";
}

export function answerQuestion(
  question: string,
  nodes: UniverseNode[],
  connections: UniverseConnection[],
) {
  const q = question.toLowerCase();
  const analysis = analyzeUniverse(nodes, connections);

  if (nodes.length === 0) {
    return "There is nothing in the universe yet. Create a few nodes and connect them, then ask again.";
  }

  if (q.includes("build next") || q.includes("what should i")) {
    if (analysis.hasAI && analysis.hasHealth) {
      return "Build the overlap: an AI-powered healthcare education platform. You already have the skill graph and the domain interest. A thin first product — one audience, one outcome — will tell you if the universe wants this.";
    }
    if (analysis.ideas.length > 0 && analysis.businesses.length > 0) {
      return `Promote one idea into a project under ${analysis.businesses[0].name}. The next build should reuse a skill you already have, not invent a new universe from scratch.`;
    }
    return openingInsight(nodes, connections);
  }

  if (q.includes("connect") || q.includes("related to")) {
    const match = nodes.find((node) => q.includes(node.name.toLowerCase()));
    if (match) {
      const linked = connections
        .filter(
          (connection) =>
            connection.sourceNodeId === match.id || connection.targetNodeId === match.id,
        )
        .map((connection) => {
          const otherId =
            connection.sourceNodeId === match.id
              ? connection.targetNodeId
              : connection.sourceNodeId;
          const other = nodes.find((node) => node.id === otherId);
          return other ? `${other.name} (${connection.relationship})` : null;
        })
        .filter(Boolean);
      if (linked.length === 0) {
        return `${match.name} is currently isolated. Connect it to a business, skill, or resource so it can start producing opportunity.`;
      }
      return `${match.name} currently connects to: ${linked.join(", ")}. Look for a missing resource or person that would make this cluster executable.`;
    }
    return "Name the node you want me to inspect. I will trace its connections and tell you what is missing around it.";
  }

  if (q.includes("resource") || q.includes("missing")) {
    if (analysis.resources.length === 0) {
      return "You have not mapped any resources. Add capital, distribution, software, data, or time — then attach them to the businesses they actually support.";
    }
    const unlinkedBusinesses = analysis.businesses.filter(
      (business) =>
        !connections.some((connection) => {
          const otherId =
            connection.sourceNodeId === business.id
              ? connection.targetNodeId
              : connection.sourceNodeId;
          const other = nodes.find((node) => node.id === otherId);
          return (
            (connection.sourceNodeId === business.id ||
              connection.targetNodeId === business.id) &&
            other?.type === "Resource"
          );
        }),
    );
    if (unlinkedBusinesses.length > 0) {
      return `${unlinkedBusinesses.map((node) => node.name).join(", ")} ${unlinkedBusinesses.length === 1 ? "has" : "have"} no attached resources. That is usually where execution stalls.`;
    }
    return "Resources exist in the map. The next question is concentration: which business is over-resourced, and which project is starving?";
  }

  if (q.includes("potential") || q.includes("highest")) {
    if (analysis.hub) {
      return `${analysis.hub.node.name} has the most gravity in this universe. Highest potential usually lives next to the densest cluster — not the newest idea.`;
    }
    return "I need more connections before I can rank potential. Density is the signal.";
  }

  if (q.includes("health")) {
    if (analysis.hasHealth) {
      return "Healthcare already appears in your universe. Pair it with a skill you already possess and a concrete audience. Do not start a new company until that triangle exists on the canvas.";
    }
    return "I do not see healthcare in the current map. If it is a real interest, add it as an idea or goal and connect it to a skill. Opportunity cannot be discovered from a node that does not exist.";
  }

  if (q.includes("opportunit")) {
    return openingInsight(nodes, connections);
  }

  return `I read ${nodes.length} nodes and ${connections.length} connections. ${openingInsight(nodes, connections)}`;
}
