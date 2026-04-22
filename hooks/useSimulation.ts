"use client";

import { useRef, useState } from "react";
import type { SimulateResponse, WorkflowGraph } from "@/types/workflow";

export function useSimulation() {
  const [logs, setLogs] = useState<SimulateResponse["steps"]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [lastRunSuccess, setLastRunSuccess] = useState(false);
  const timelineTimerRef = useRef<number | null>(null);

  const runSimulation = async (workflow: WorkflowGraph): Promise<boolean> => {
    setIsRunning(true);
    setErrors([]);
    setLogs([]);
    setLastRunSuccess(false);
    if (timelineTimerRef.current) {
      window.clearInterval(timelineTimerRef.current);
      timelineTimerRef.current = null;
    }

    try {
      const response = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workflow),
      });

      const result = (await response.json()) as SimulateResponse;
      if (!response.ok) {
        setErrors(result.errors.length > 0 ? result.errors : ["Simulation failed."]);
        setLogs([]);
        setActiveNodeId(null);
        setLastRunSuccess(false);
        return false;
      }
      setLogs(result.steps);
      setErrors(result.errors);
      setLastRunSuccess(result.success);
      playTimeline(result.steps);
      return result.success;
    } catch (error) {
      setErrors([error instanceof Error ? error.message : "Simulation failed."]);
      setActiveNodeId(null);
      setLastRunSuccess(false);
      return false;
    } finally {
      setIsRunning(false);
    }
  };

  const clearSimulation = () => {
    setLogs([]);
    setErrors([]);
    setActiveNodeId(null);
    setLastRunSuccess(false);
  };

  const playTimeline = (steps: SimulateResponse["steps"]) => {
    if (steps.length === 0) {
      setActiveNodeId(null);
      return;
    }

    let index = 0;
    setActiveNodeId(steps[0].nodeId);
    timelineTimerRef.current = window.setInterval(() => {
      index += 1;
      if (index >= steps.length) {
        if (timelineTimerRef.current) {
          window.clearInterval(timelineTimerRef.current);
          timelineTimerRef.current = null;
        }
        return;
      }
      setActiveNodeId(steps[index].nodeId);
    }, 700);
  };

  return {
    logs,
    errors,
    isRunning,
    activeNodeId,
    lastRunSuccess,
    runSimulation,
    clearSimulation,
  };
}

