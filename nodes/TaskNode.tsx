import { Handle, Position, type NodeProps } from "reactflow";
import type { WorkflowNodeData } from "@/types/workflow";

export function TaskNode({ data, selected }: NodeProps<WorkflowNodeData<"task">>) {
  const severityClass = data.validationSeverity ?? "";
  const tooltip = data.validationMessages?.join("\n");
  return (
    <div className={`workflow-node task ${selected ? "selected" : ""} ${severityClass}`}>
      {data.validationSeverity ? (
        <span className={`validation-badge ${data.validationSeverity}`} title={tooltip}>
          {data.validationSeverity === "error" ? "!" : "⚠"}
        </span>
      ) : null}
      <Handle type="target" position={Position.Left} />
      <div className="node-title">{data.config.title || "Task"}</div>
      <small>Assignee: {data.config.assignee || "Unassigned"}</small>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

