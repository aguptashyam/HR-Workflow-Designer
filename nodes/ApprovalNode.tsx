import { Handle, Position, type NodeProps } from "reactflow";
import type { WorkflowNodeData } from "@/types/workflow";

export function ApprovalNode({ data, selected }: NodeProps<WorkflowNodeData<"approval">>) {
  const severityClass = data.validationSeverity ?? "";
  const tooltip = data.validationMessages?.join("\n");
  return (
    <div className={`workflow-node approval ${selected ? "selected" : ""} ${severityClass}`}>
      {data.validationSeverity ? (
        <span className={`validation-badge ${data.validationSeverity}`} title={tooltip}>
          {data.validationSeverity === "error" ? "!" : "⚠"}
        </span>
      ) : null}
      <Handle type="target" position={Position.Left} />
      <div className="node-title">{data.config.title || "Approval"}</div>
      <small>Role: {data.config.approverRole}</small>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

