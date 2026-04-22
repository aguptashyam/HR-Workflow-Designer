"use client";

import type { SimulationStep } from "@/types/workflow";

interface ExecutionLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: SimulationStep[];
  wasSuccessful: boolean;
  isRunning: boolean;
  errors: string[];
}

export function ExecutionLogModal({
  isOpen,
  onClose,
  logs,
  wasSuccessful,
  isRunning,
  errors,
}: ExecutionLogModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content execution-log-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-section">
            <h2>Workflow Execution Log</h2>
            {wasSuccessful && (
              <span className="status-badge success">Success</span>
            )}
            {errors.length > 0 && !isRunning && (
              <span className="status-badge error">Failed</span>
            )}
          </div>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
            title="Close (Esc)"
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          {errors.length > 0 && (
            <div className="error-box">
              <div className="error-title">Errors encountered:</div>
              {errors.map((error) => (
                <p key={error}>• {error}</p>
              ))}
            </div>
          )}

          {isRunning && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Running workflow...</p>
            </div>
          )}

          {!isRunning && logs.length === 0 && errors.length === 0 && (
            <p className="panel-subtext">No execution logs yet. Click &quot;Run Workflow&quot; to start.</p>
          )}

          {logs.length > 0 && (
            <ol className="timeline">
              {logs.map((log, index) => (
                <li key={`${log.nodeId}-${index}`} className="timeline-item">
                  <div className="timeline-marker">✓</div>
                  <div className="timeline-content">
                    <div className="timeline-row">
                      <div className="timeline-title">
                        Step {index + 1} <span className="timeline-type">{log.nodeType}</span>
                      </div>
                      <small>{new Date().toISOString()}</small>
                    </div>
                    <p>{log.details}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

      </div>
    </div>
  );
}
