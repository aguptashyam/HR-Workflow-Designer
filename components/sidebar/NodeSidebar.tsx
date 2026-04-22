"use client";

import type { WorkflowNodeType } from "@/types/workflow";

const nodePalette: { type: WorkflowNodeType; label: string; description: string }[] = [
  { type: "start", label: "Start", description: "Workflow entry point" },
  { type: "task", label: "Task", description: "Human task" },
  { type: "approval", label: "Approval", description: "Decision step" },
  { type: "automated", label: "Automated Step", description: "System automation" },
  { type: "end", label: "End", description: "Workflow termination" },
];

export function NodeSidebar() {
  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: WorkflowNodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className="sidebar-panel">
      <h3>Nodes</h3>
      <p className="panel-subtext">Drag into canvas</p>
      <div className="node-palette">
        {nodePalette.map((node) => (
          <div
            key={node.type}
            className={`palette-item ${node.type}`}
            onDragStart={(event) => onDragStart(event, node.type)}
            draggable
          >
            <div className="palette-title">{node.label}</div>
            <small>{node.description}</small>
          </div>
        ))}
      </div>
    </aside>
  );
}

