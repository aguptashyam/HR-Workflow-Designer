"use client";

import { useRef, useState } from "react";
import type { WorkflowExportFile, WorkflowGraph } from "@/types/workflow";

interface WorkflowToolbarProps {
  onExport: () => WorkflowGraph;
  onImport: (workflow: WorkflowGraph) => void;
  onLoadTemplate: () => void;
  onClearWorkflow: () => void;
  onRunWorkflow?: () => void;
  isRunning?: boolean;
}

export function WorkflowToolbar({
  onExport,
  onImport,
  onLoadTemplate,
  onClearWorkflow,
  onRunWorkflow,
  isRunning,
}: WorkflowToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [pendingImport, setPendingImport] = useState<WorkflowGraph | null>(null);

  const exportWorkflow = () => {
    const payload = onExport();
    const exportFile: WorkflowExportFile = {
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      workflow: payload,
    };
    const blob = new Blob([JSON.stringify(exportFile, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "workflow.json";
    anchor.click();
    URL.revokeObjectURL(url);
    setShowExportConfirm(false);
  };

  const importWorkflow = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as WorkflowExportFile | WorkflowGraph;
      const workflow = (parsed as WorkflowExportFile).workflow
        ? (parsed as WorkflowExportFile).workflow
        : (parsed as WorkflowGraph);

      if (!isValidWorkflowStructure(workflow)) {
        throw new Error("Invalid workflow format.");
      }
      setPendingImport(workflow);
      setShowImportConfirm(true);
    } catch {
      // Keep silent here because execution/result state is surfaced in the workflow UI.
    }
    event.target.value = "";
  };

  return (
    <div className="toolbar-actions">
      <div className="toolbar-primary">
        <button type="button" onClick={onLoadTemplate} title="Load onboarding template">
          Load Onboarding Template
        </button>
        {onRunWorkflow && (
          <button
            type="button"
            onClick={onRunWorkflow}
            disabled={isRunning}
            className="run-workflow-btn"
            title="Run workflow simulation"
          >
            {isRunning ? "Running..." : "Run Workflow"}
          </button>
        )}
        <button type="button" onClick={() => setShowExportConfirm(true)} title="Export workflow">
          <span className="toolbar-icon" aria-hidden="true">⭱</span>
          <span>Export</span>
        </button>
        <button type="button" onClick={() => fileInputRef.current?.click()} title="Import workflow">
          <span className="toolbar-icon" aria-hidden="true">⭳</span>
          <span>Import</span>
        </button>
      </div>
      <div className="toolbar-tertiary">
        <button type="button" className="danger-btn" onClick={() => setShowClearConfirm(true)}>
          Clear Workflow
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        onChange={importWorkflow}
        hidden
      />
      {showClearConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-dialog">
            <p>Are you sure want to clear the current worflow?</p>
            <div className="confirm-actions">
              <button type="button" onClick={() => setShowClearConfirm(false)}>
                No
              </button>
              <button
                type="button"
                className="danger-btn"
                onClick={() => {
                  onClearWorkflow();
                  setShowClearConfirm(false);
                }}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
      {showExportConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-dialog">
            <p>Are you sure want to export the current workflow?</p>
            <div className="confirm-actions">
              <button type="button" onClick={() => setShowExportConfirm(false)}>
                No
              </button>
              <button type="button" onClick={exportWorkflow}>
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
      {showImportConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-dialog">
            <p>Import will replace current workflow. Continue?</p>
            <div className="confirm-actions">
              <button
                type="button"
                onClick={() => {
                  setShowImportConfirm(false);
                  setPendingImport(null);
                }}
              >
                No
              </button>
              <button
                type="button"
                onClick={() => {
                  if (pendingImport) {
                    onImport(pendingImport);
                  }
                  setShowImportConfirm(false);
                  setPendingImport(null);
                }}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function isValidWorkflowStructure(workflow: WorkflowGraph): boolean {
  if (!workflow || !Array.isArray(workflow.nodes) || !Array.isArray(workflow.edges)) {
    return false;
  }
  return workflow.nodes.every((node) => Boolean(node.id && node.type && node.position && node.data));
}

