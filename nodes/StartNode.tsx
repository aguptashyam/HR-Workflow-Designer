import { Handle, Position, type NodeProps } from "reactflow";
import type { WorkflowNodeData } from "@/types/workflow";

export function StartNode({ data, selected }: NodeProps<WorkflowNodeData<"start">>) {
  const severityClass = data.validationSeverity ?? "";
  const tooltip = data.validationMessages?.join("\n");
  return (
    <div className={`workflow-node start ${selected ? "selected" : ""} ${severityClass}`}>
      {data.validationSeverity ? (
        <span className={`validation-badge ${data.validationSeverity}`} title={tooltip}>
          {data.validationSeverity === "error" ? "!" : "⚠"}
        </span>
      ) : null}
      <div className="node-title">{data.config.title || "Start"}</div>
      <small>Entry point</small>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

