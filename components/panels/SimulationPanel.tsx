"use client";

import type { SimulationStep } from "@/types/workflow";

interface SimulationPanelProps {
  errors: string[];
  logs: SimulationStep[];
  wasSuccessful: boolean;
}

export function SimulationPanel({ errors, logs, wasSuccessful }: SimulationPanelProps) {
  return (
    <section className="simulation-panel">
      <div className="simulation-header">
        <h3>Workflow Status</h3>
        <div className="simulation-header-actions">
          {wasSuccessful ? <span className="status-badge success">Success</span> : null}
        </div>
      </div>

      {errors.length > 0 && (
        <div className="error-box">
          <div className="error-summary">
            <strong>{errors.length} error(s) found</strong>
          </div>
          {errors.slice(0, 3).map((error) => (
            <p key={error}>- {error}</p>
          ))}
          {errors.length > 3 && <p className="muted">+ {errors.length - 3} more...</p>}
        </div>
      )}

      {logs.length === 0 && errors.length === 0 && (
        <p className="panel-subtext">Run workflow to see execution logs in the modal.</p>
      )}

      {logs.length > 0 && (
        <p className="panel-subtext">Completed {logs.length} step(s). Open modal to view details.</p>
      )}
    </section>
  );
}

