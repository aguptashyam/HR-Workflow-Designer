import type { Edge, Node } from "reactflow";

export type WorkflowNodeType =
  | "start"
  | "task"
  | "approval"
  | "automated"
  | "end";

export type ApproverRole = "Manager" | "HRBP" | "Director" | "VP" | "CEO";

export interface StartNodeConfig {
  title: string;
  metadata: Record<string, string>;
}

export interface TaskNodeConfig {
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  customFields: Record<string, string>;
}

export interface ApprovalNodeConfig {
  title: string;
  approverRole: ApproverRole;
  autoApproveThreshold: number;
}

export interface AutomatedNodeConfig {
  title: string;
  action: string;
  params: Record<string, string>;
}

export interface EndNodeConfig {
  endMessage: string;
  summaryFlag: boolean;
}

export type WorkflowNodeConfigByType = {
  start: StartNodeConfig;
  task: TaskNodeConfig;
  approval: ApprovalNodeConfig;
  automated: AutomatedNodeConfig;
  end: EndNodeConfig;
};

export interface WorkflowNodeData<TType extends WorkflowNodeType = WorkflowNodeType> {
  nodeType: TType;
  label: string;
  config: WorkflowNodeConfigByType[TType];
  validationSeverity?: "error" | "warning";
  validationMessages?: string[];
}

export type WorkflowNode = Node<WorkflowNodeData, WorkflowNodeType>;
export type WorkflowEdge = Edge;

export interface WorkflowGraph {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface AutomationAction {
  id: string;
  label: string;
  params: string[];
}

export interface ValidationIssue {
  code:
    | "MULTIPLE_START"
    | "MISSING_START"
    | "INVALID_START_INCOMING"
    | "INVALID_END_OUTGOING"
    | "ISOLATED_NODE"
    | "HAS_CYCLE"
    | "MISSING_CONNECTION"
    | "AUTOMATED_ACTION_REQUIRED"
    | "MISSING_TASK_ASSIGNEE"
    | "LOW_APPROVAL_THRESHOLD";
  message: string;
  nodeId?: string;
  severity: "error" | "warning";
}

export interface WorkflowExportFile {
  version: string;
  exportedAt: string;
  workflow: WorkflowGraph;
}

export interface SimulationStep {
  nodeId: string;
  nodeType: WorkflowNodeType;
  label: string;
  details: string;
}

export interface SimulateResponse {
  success: boolean;
  errors: string[];
  steps: SimulationStep[];
}

export const DEFAULT_NODE_CONFIGS: WorkflowNodeConfigByType = {
  start: {
    title: "Start",
    metadata: {},
  },
  task: {
    title: "Task",
    description: "",
    assignee: "",
    dueDate: "",
    customFields: {},
  },
  approval: {
    title: "Approval",
    approverRole: "Manager",
    autoApproveThreshold: 0,
  },
  automated: {
    title: "Automated Step",
    action: "",
    params: {},
  },
  end: {
    endMessage: "Workflow completed.",
    summaryFlag: false,
  },
};

