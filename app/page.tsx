"use client";

import { useEffect, useMemo, useState } from "react";
import { WorkflowCanvas } from "@/components/canvas/WorkflowCanvas";
import { NodeSidebar } from "@/components/sidebar/NodeSidebar";
import { NodeConfigPanel } from "@/components/panels/NodeConfigPanel";
import { SimulationPanel } from "@/components/panels/SimulationPanel";
import { ExecutionLogModal } from "@/components/panels/ExecutionLogModal";
import { WorkflowToolbar } from "@/components/panels/WorkflowToolbar";
import { useWorkflowState } from "@/hooks/useWorkflowState";
import { useSimulation } from "@/hooks/useSimulation";
import { validateWorkflow } from "@/utils/validation";
import { buildOnboardingTemplate } from "@/utils/templates";

export default function Home() {
  const workflow = useWorkflowState();
  const simulation = useSimulation();
  const [logModalOpen, setLogModalOpen] = useState(false);

  const validationIssues = useMemo(
    () => validateWorkflow({ nodes: workflow.nodes, edges: workflow.edges }),
    [workflow.nodes, workflow.edges],
  );
  const validationByNode = useMemo(() => {
    const map = new Map<string, { severity: "error" | "warning"; messages: string[] }>();
    validationIssues.forEach((issue) => {
      if (!issue.nodeId) {
        return;
      }
      const current = map.get(issue.nodeId);
      const nextSeverity =
        current?.severity === "error" || issue.severity === "error" ? "error" : "warning";
      map.set(issue.nodeId, {
        severity: nextSeverity,
        messages: [...(current?.messages ?? []), issue.message],
      });
    });
    return map;
  }, [validationIssues]);

  const displayNodes = useMemo(
    () =>
      workflow.nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          validationSeverity: validationByNode.get(node.id)?.severity,
          validationMessages: validationByNode.get(node.id)?.messages ?? [],
        },
        className: simulation.activeNodeId === node.id ? "node-active" : "",
      })),
    [workflow.nodes, validationByNode, simulation.activeNodeId],
  );

  useEffect(() => {
    simulation.clearSimulation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflow.nodes, workflow.edges]);

  const runSimulation = async () => {
    const errorIssues = validationIssues.filter((issue) => issue.severity === "error");

    if (errorIssues.length > 0) {
      return;
    }

    await simulation.runSimulation(workflow.serialize());
  };

  const combinedErrors = [
    ...(workflow.graphError ? [workflow.graphError] : []),
    ...validationIssues.filter((issue) => issue.severity === "error").map((issue) => issue.message),
    ...simulation.errors,
  ];

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <h1>HR Workflow Designer</h1>
          <p className="panel-subtext">Design and simulate HR process workflows.</p>
        </div>
        <WorkflowToolbar
          onExport={workflow.serialize}
          onImport={workflow.replaceWorkflow}
          onLoadTemplate={() => workflow.replaceWorkflow(buildOnboardingTemplate())}
          onClearWorkflow={workflow.clearWorkflow}
          onRunWorkflow={() => {
            setLogModalOpen(true);
            runSimulation();
          }}
          isRunning={simulation.isRunning}
        />
      </header>

      <section className={`workspace-grid ${workflow.selectedNode ? "with-config" : "without-config"}`}>
        <NodeSidebar />
        <WorkflowCanvas
          nodes={displayNodes}
          edges={workflow.edges}
          onNodesChange={workflow.onNodesChange}
          onEdgesChange={workflow.onEdgesChange}
          onConnect={workflow.onConnect}
          onNodeSelect={workflow.setSelectedNodeId}
          addNode={workflow.addNode}
        />
        {workflow.selectedNode && (
          <NodeConfigPanel
            selectedNode={workflow.selectedNode}
            updateNodeConfig={workflow.updateNodeConfig}
          />
        )}
      </section>

      <SimulationPanel
        errors={Array.from(new Set(combinedErrors))}
        logs={simulation.logs}
        wasSuccessful={simulation.lastRunSuccess}
      />
      <ExecutionLogModal
        isOpen={logModalOpen}
        onClose={() => setLogModalOpen(false)}
        logs={simulation.logs}
        wasSuccessful={simulation.lastRunSuccess}
        isRunning={simulation.isRunning}
        errors={Array.from(new Set(combinedErrors))}
      />
    </main>
  );
}
