import type { WorkflowEdge, WorkflowGraph, WorkflowNode } from "@/types/workflow";

export interface GraphAdjacency {
  outgoing: Map<string, string[]>;
  incoming: Map<string, string[]>;
}

export function buildAdjacency(graph: WorkflowGraph): GraphAdjacency {
  const outgoing = new Map<string, string[]>();
  const incoming = new Map<string, string[]>();

  graph.nodes.forEach((node) => {
    outgoing.set(node.id, []);
    incoming.set(node.id, []);
  });

  graph.edges.forEach((edge) => {
    outgoing.set(edge.source, [...(outgoing.get(edge.source) ?? []), edge.target]);
    incoming.set(edge.target, [...(incoming.get(edge.target) ?? []), edge.source]);
  });

  return { outgoing, incoming };
}

export function findStartNode(nodes: WorkflowNode[]): WorkflowNode | undefined {
  return nodes.find((node) => node.type === "start");
}

export function detectCycle(graph: WorkflowGraph): boolean {
  const { outgoing } = buildAdjacency(graph);
  const visiting = new Set<string>();
  const visited = new Set<string>();

  const dfs = (nodeId: string): boolean => {
    if (visiting.has(nodeId)) {
      return true;
    }
    if (visited.has(nodeId)) {
      return false;
    }

    visiting.add(nodeId);

    for (const next of outgoing.get(nodeId) ?? []) {
      if (dfs(next)) {
        return true;
      }
    }

    visiting.delete(nodeId);
    visited.add(nodeId);
    return false;
  };

  return graph.nodes.some((node) => dfs(node.id));
}

export function getReachableNodeIds(
  startNodeId: string,
  edges: WorkflowEdge[],
): Set<string> {
  const outgoing = new Map<string, string[]>();

  edges.forEach((edge) => {
    outgoing.set(edge.source, [...(outgoing.get(edge.source) ?? []), edge.target]);
  });

  const visited = new Set<string>();
  const queue = [startNodeId];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || visited.has(current)) {
      continue;
    }

    visited.add(current);
    const next = outgoing.get(current) ?? [];
    next.forEach((nextNodeId) => {
      if (!visited.has(nextNodeId)) {
        queue.push(nextNodeId);
      }
    });
  }

  return visited;
}

export function simulateTraversal(graph: WorkflowGraph): string[] {
  const start = findStartNode(graph.nodes);
  if (!start) {
    return [];
  }

  const { outgoing } = buildAdjacency(graph);
  const path: string[] = [];
  const visited = new Set<string>();

  const walk = (nodeId: string) => {
    if (visited.has(nodeId)) {
      return;
    }

    visited.add(nodeId);
    path.push(nodeId);

    const nextNodes = outgoing.get(nodeId) ?? [];
    nextNodes.forEach((next) => walk(next));
  };

  walk(start.id);
  return path;
}

