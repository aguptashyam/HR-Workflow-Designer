import type { ValidationIssue, WorkflowGraph } from "@/types/workflow";
import { buildAdjacency, detectCycle, findStartNode, getReachableNodeIds } from "@/utils/graphUtils";

export function validateWorkflow(graph: WorkflowGraph): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const startNodes = graph.nodes.filter((node) => node.type === "start");
  const endNodes = graph.nodes.filter((node) => node.type === "end");

  if (startNodes.length === 0) {
    issues.push({
      code: "MISSING_START",
      message: "Workflow must contain exactly one Start node.",
      severity: "error",
    });
  }

  if (startNodes.length > 1) {
    issues.push({
      code: "MULTIPLE_START",
      message: "Only one Start node is allowed.",
      severity: "error",
    });
  }

  const { incoming, outgoing } = buildAdjacency(graph);

  startNodes.forEach((startNode) => {
    if ((incoming.get(startNode.id) ?? []).length > 0) {
      issues.push({
        code: "INVALID_START_INCOMING",
        message: "Start node cannot have incoming edges.",
        nodeId: startNode.id,
        severity: "error",
      });
    }
  });

  endNodes.forEach((endNode) => {
    if ((outgoing.get(endNode.id) ?? []).length > 0) {
      issues.push({
        code: "INVALID_END_OUTGOING",
        message: "End node cannot have outgoing edges.",
        nodeId: endNode.id,
        severity: "error",
      });
    }
  });

  if (detectCycle(graph)) {
    issues.push({
      code: "HAS_CYCLE",
      message: "Workflow cannot contain cycles.",
      severity: "error",
    });
  }

  const start = findStartNode(graph.nodes);
  if (start) {
    const reachable = getReachableNodeIds(start.id, graph.edges);
    graph.nodes.forEach((node) => {
      if (!reachable.has(node.id)) {
        issues.push({
          code: "MISSING_CONNECTION",
          message: "All nodes must be connected to the Start path.",
          nodeId: node.id,
          severity: "error",
        });
      }
    });
  }

  graph.nodes.forEach((node) => {
    const hasAnyConnection =
      (incoming.get(node.id) ?? []).length > 0 || (outgoing.get(node.id) ?? []).length > 0;

    if (!hasAnyConnection && graph.nodes.length > 1) {
      issues.push({
        code: "ISOLATED_NODE",
        message: "Node is isolated and must be connected.",
        nodeId: node.id,
        severity: "error",
      });
    }

    if (node.data.nodeType === "automated") {
      const action = (node.data.config as { action?: string }).action?.trim();
      if (!action) {
        issues.push({
          code: "AUTOMATED_ACTION_REQUIRED",
          message: "Automated step must have an action selected.",
          nodeId: node.id,
          severity: "error",
        });
      }
    }

    if (node.data.nodeType === "task") {
      const assignee = (node.data.config as { assignee?: string }).assignee?.trim();
      if (!assignee) {
        issues.push({
          code: "MISSING_TASK_ASSIGNEE",
          message: "Task has no assignee. Consider assigning an owner.",
          nodeId: node.id,
          severity: "warning",
        });
      }
    }

    if (node.data.nodeType === "approval") {
      const threshold = Number((node.data.config as { autoApproveThreshold?: number }).autoApproveThreshold ?? 0);
      if (threshold <= 0) {
        issues.push({
          code: "LOW_APPROVAL_THRESHOLD",
          message: "Auto-approval threshold is not set or is too low.",
          nodeId: node.id,
          severity: "warning",
        });
      }
    }
  });

  return issues;
}

