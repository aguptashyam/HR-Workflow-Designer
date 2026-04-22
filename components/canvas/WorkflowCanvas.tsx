"use client";

import { useCallback, useMemo, useRef } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  type Connection,
  type EdgeChange,
  type NodeChange,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import type { WorkflowEdge, WorkflowNode, WorkflowNodeType } from "@/types/workflow";
import { StartNode } from "@/nodes/StartNode";
import { TaskNode } from "@/nodes/TaskNode";
import { ApprovalNode } from "@/nodes/ApprovalNode";
import { AutomatedNode } from "@/nodes/AutomatedNode";
import { EndNode } from "@/nodes/EndNode";

interface WorkflowCanvasProps {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  onNodeSelect: (nodeId: string | null) => void;
  addNode: (nodeType: WorkflowNodeType, position: { x: number; y: number }) => void;
}

const nodeTypes = {
  start: StartNode,
  task: TaskNode,
  approval: ApprovalNode,
  automated: AutomatedNode,
  end: EndNode,
};

function CanvasContent(props: WorkflowCanvasProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const nodeType = event.dataTransfer.getData("application/reactflow") as WorkflowNodeType;

      if (!nodeType || !wrapperRef.current) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      props.addNode(nodeType, position);
    },
    [props, screenToFlowPosition],
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  return (
    <div className="canvas-panel" ref={wrapperRef}>
      <ReactFlow
        nodes={props.nodes}
        edges={props.edges}
        onNodesChange={props.onNodesChange}
        onEdgesChange={props.onEdgesChange}
        onConnect={props.onConnect}
        nodeTypes={useMemo(() => nodeTypes, [])}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={(_, node) => props.onNodeSelect(node.id)}
        onPaneClick={() => props.onNodeSelect(null)}
        fitView
        deleteKeyCode={["Backspace", "Delete"]}
      >
        <MiniMap
          pannable
          zoomable
          nodeColor={(node) => {
            const severity = node.data?.validationSeverity as "error" | "warning" | undefined;
            if (severity === "error") {
              return "#ef4444";
            }
            if (severity === "warning") {
              return "#f59e0b";
            }
            return "#93c5fd";
          }}
        />
        <Controls />
        <Background gap={20} size={1.2} />
      </ReactFlow>
    </div>
  );
}

export function WorkflowCanvas(props: WorkflowCanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasContent {...props} />
    </ReactFlowProvider>
  );
}

