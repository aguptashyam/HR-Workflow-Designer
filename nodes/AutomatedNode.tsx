import { Handle, Position, type NodeProps } from "reactflow";
import type { WorkflowNodeData } from "@/types/workflow";

export function AutomatedNode({ data, selected }: NodeProps<WorkflowNodeData<"automated">>) {
  const severityClass = data.validationSeverity ?? "";
  const tooltip = data.validationMessages?.join("\n");
  return (
    <div className={`workflow-node automated ${selected ? "selected" : ""} ${severityClass}`}>
      {data.validationSeverity ? (
        <span className={`validation-badge ${data.validationSeverity}`} title={tooltip}>
          {data.validationSeverity === "error" ? "!" : "⚠"}
        </span>
      ) : null}
      <Handle type="target" position={Position.Left} />
      <div className="node-title">{data.config.title || "Automated Step"}</div>
      <small>Action: {data.config.action || "None selected"}</small>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

