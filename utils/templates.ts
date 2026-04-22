import type { WorkflowGraph, WorkflowNode, WorkflowNodeType } from "@/types/workflow";
import { DEFAULT_NODE_CONFIGS } from "@/types/workflow";

function makeNode(
  id: string,
  type: WorkflowNodeType,
  x: number,
  y: number,
  config: WorkflowNode["data"]["config"],
  label: string,
): WorkflowNode {
  return {
    id,
    type,
    position: { x, y },
    data: {
      nodeType: type,
      label,
      config,
    },
  };
}

export function buildOnboardingTemplate(): WorkflowGraph {
  const nodes: WorkflowNode[] = [
    makeNode("start-template", "start", 80, 150, { ...DEFAULT_NODE_CONFIGS.start }, "Start"),
    makeNode(
      "task-template-1",
      "task",
      320,
      150,
      {
        ...DEFAULT_NODE_CONFIGS.task,
        title: "Collect Employee Documents",
        assignee: "HR Coordinator",
      },
      "Collect Employee Documents",
    ),
    makeNode(
      "approval-template",
      "approval",
      580,
      150,
      {
        ...DEFAULT_NODE_CONFIGS.approval,
        title: "Manager Approval",
        approverRole: "Manager",
      },
      "Manager Approval",
    ),
    makeNode(
      "automated-template",
      "automated",
      840,
      150,
      {
        ...DEFAULT_NODE_CONFIGS.automated,
        title: "Send Welcome Email",
        action: "send_email",
        params: { to: "employee@email.com", subject: "Welcome Aboard" },
      },
      "Send Welcome Email",
    ),
    makeNode(
      "end-template",
      "end",
      1080,
      150,
      {
        ...DEFAULT_NODE_CONFIGS.end,
        endMessage: "Onboarding completed",
      },
      "Onboarding completed",
    ),
  ];

  const edges = [
    { id: "e1", source: "start-template", target: "task-template-1" },
    { id: "e2", source: "task-template-1", target: "approval-template" },
    { id: "e3", source: "approval-template", target: "automated-template" },
    { id: "e4", source: "automated-template", target: "end-template" },
  ];

  return { nodes, edges };
}

