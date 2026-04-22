"use client";

import { useMemo, useState } from "react";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  type NodeChange,
} from "reactflow";
import type {
  EndNodeConfig,
  WorkflowEdge,
  WorkflowNode,
  WorkflowNodeType,
} from "@/types/workflow";
import { DEFAULT_NODE_CONFIGS } from "@/types/workflow";
import { detectCycle } from "@/utils/graphUtils";

const initialNodes: WorkflowNode[] = [
  {
    id: "start-1",
    type: "start",
    position: { x: 180, y: 100 },
    data: {
      nodeType: "start",
      label: "Start",
      config: structuredClone(DEFAULT_NODE_CONFIGS.start),
    },
  },
];

export function useWorkflowState() {
  const [nodes, setNodes] = useState<WorkflowNode[]>(initialNodes);
  const [edges, setEdges] = useState<WorkflowEdge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(initialNodes[0].id);
  const [graphError, setGraphError] = useState<string | null>(null);

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId],
  );

  const commitState = (nextNodes: WorkflowNode[], nextEdges: WorkflowEdge[]) => {
    setNodes(nextNodes);
    setEdges(nextEdges);
  };

  const onNodesChange = (changes: NodeChange[]) => {
    const nextNodes = applyNodeChanges(changes, nodes) as WorkflowNode[];
    commitState(nextNodes, edges);
  };

  const onEdgesChange = (changes: EdgeChange[]) => {
    const nextEdges = applyEdgeChanges(changes, edges);
    commitState(nodes, nextEdges);
  };

  const onConnect = (connection: Connection) => {
    if (!connection.source || !connection.target) {
      return;
    }

    const sourceNode = nodes.find((node) => node.id === connection.source);
    const targetNode = nodes.find((node) => node.id === connection.target);

    if (!sourceNode || !targetNode) {
      return;
    }

    if (targetNode.type === "start") {
      setGraphError("Start node cannot have incoming edges.");
      return;
    }

    if (sourceNode.type === "end") {
      setGraphError("End node cannot have outgoing edges.");
      return;
    }

    const nextEdges = addEdge(connection, edges);
    const nextGraph = { nodes, edges: nextEdges };
    if (detectCycle(nextGraph)) {
      setGraphError("Cannot create cyclic dependency.");
      return;
    }

    setGraphError(null);
    commitState(nodes, nextEdges);
  };

  const addNode = (nodeType: WorkflowNodeType, position: { x: number; y: number }) => {
    if (nodeType === "start" && nodes.some((node) => node.type === "start")) {
      setGraphError("Only one Start node is allowed.");
      return;
    }

    const id = `${nodeType}-${Date.now()}`;
    const config = structuredClone(DEFAULT_NODE_CONFIGS[nodeType]);
    const label =
      nodeType === "automated"
        ? "Automated Step"
        : nodeType.charAt(0).toUpperCase() + nodeType.slice(1);

    const node: WorkflowNode = {
      id,
      type: nodeType,
      position,
      data: {
        nodeType,
        label,
        config,
      },
    };

    commitState([...nodes, node], edges);
    // Keep config panel closed until user explicitly clicks a node.
    setSelectedNodeId(null);
    setGraphError(null);
  };

  const updateNodeConfig = (nodeId: string, config: WorkflowNode["data"]["config"]) => {
    const nextNodes = nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                config,
                label: resolveLabel(node.data.nodeType, config),
              },
            }
          : node,
      );
    commitState(nextNodes, edges);
  };

  const serialize = () => ({ nodes, edges });

  const replaceWorkflow = (workflow: { nodes: WorkflowNode[]; edges: WorkflowEdge[] }) => {
    commitState(workflow.nodes, workflow.edges);
    setSelectedNodeId(workflow.nodes[0]?.id ?? null);
    setGraphError(null);
  };

  const clearWorkflow = () => {
    commitState([], []);
    setSelectedNodeId(null);
    setGraphError(null);
  };

  return {
    nodes,
    edges,
    graphError,
    selectedNode,
    setGraphError,
    setSelectedNodeId,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    updateNodeConfig,
    serialize,
    replaceWorkflow,
    clearWorkflow,
  };
}

function resolveLabel(nodeType: WorkflowNodeType, config: WorkflowNode["data"]["config"]): string {
  switch (nodeType) {
    case "start":
      return (config as { title?: string }).title || "Start";
    case "task":
      return (config as { title?: string }).title || "Task";
    case "approval":
      return (config as { title?: string }).title || "Approval";
    case "automated":
      return (config as { title?: string }).title || "Automated Step";
    case "end":
      return (config as EndNodeConfig).endMessage || "End";
    default:
      return "Node";
  }
}

