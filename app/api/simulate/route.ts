import { NextResponse } from "next/server";
import type { SimulateResponse, WorkflowGraph, WorkflowNode } from "@/types/workflow";
import { validateWorkflow } from "@/utils/validation";
import { simulateTraversal } from "@/utils/graphUtils";

export async function POST(request: Request) {
  const workflow = (await request.json()) as WorkflowGraph;
  const validationErrors = validateWorkflow(workflow);

  if (validationErrors.length > 0) {
    const response: SimulateResponse = {
      success: false,
      errors: validationErrors.map((error) => error.message),
      steps: [],
    };
    return NextResponse.json(response, { status: 400 });
  }

  const traversal = simulateTraversal(workflow);
  const steps = traversal
    .map((nodeId) => workflow.nodes.find((node) => node.id === nodeId))
    .filter((node): node is WorkflowGraph["nodes"][number] => Boolean(node))
    .map((node) => ({
      nodeId: node.id,
      nodeType: node.data.nodeType,
      label: node.data.label,
      details: buildNodeDetails(node),
    }));

  const response: SimulateResponse = {
    success: true,
    errors: [],
    steps,
  };

  return NextResponse.json(response);
}

function buildNodeDetails(node: WorkflowNode): string {
  switch (node.type) {
    case "start": {
      const config = node.data.config as { title: string };
      return `Entered workflow: ${config.title}`;
    }
    case "task": {
      const config = node.data.config as { assignee: string };
      return `Task assigned to ${config.assignee || "Unassigned"}`;
    }
    case "approval": {
      const config = node.data.config as { approverRole: string };
      return `Approval requested from role: ${config.approverRole}`;
    }
    case "automated": {
      const config = node.data.config as { action: string };
      return `Executed automation: ${config.action || "Unknown action"}`;
    }
    case "end": {
      const config = node.data.config as { endMessage: string };
      return config.endMessage || "Workflow completed";
    }
    default:
      return "Executed step";
  }
}

