import { Handle, Position, type NodeProps } from "reactflow";
import type { WorkflowNodeData } from "@/types/workflow";

export function EndNode({ data, selected }: NodeProps<WorkflowNodeData<"end">>) {
  const severityClass = data.validationSeverity ?? "";
  const tooltip = data.validationMessages?.join("\n");
  return (
    <div className={`workflow-node end ${selected ? "selected" : ""} ${severityClass}`}>
      {data.validationSeverity ? (
        <span className={`validation-badge ${data.validationSeverity}`} title={tooltip}>
          {data.validationSeverity === "error" ? "!" : "⚠"}
        </span>
      ) : null}
      <Handle type="target" position={Position.Left} />
      <div className="node-title">End</div>
      <small>{data.config.endMessage || "Workflow completed."}</small>
    </div>
  );
}

