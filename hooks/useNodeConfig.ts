"use client";

import { useEffect, useState } from "react";
import type { AutomationAction } from "@/types/workflow";

export function useNodeConfig() {
  const [automations, setAutomations] = useState<AutomationAction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAutomations = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/automations");
        if (!response.ok) {
          throw new Error("Failed to load automation actions.");
        }
        const data = (await response.json()) as AutomationAction[];
        setAutomations(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unexpected error.");
      } finally {
        setLoading(false);
      }
    };

    loadAutomations();
  }, []);

  return { automations, loading, error };
}

