"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import type {
  AutomatedNodeConfig,
  WorkflowNode,
  WorkflowNodeConfigByType,
  WorkflowNodeType,
} from "@/types/workflow";
import { useNodeConfig } from "@/hooks/useNodeConfig";

interface NodeConfigPanelProps {
  selectedNode: WorkflowNode | null;
  updateNodeConfig: (nodeId: string, config: WorkflowNode["data"]["config"]) => void;
}

type ConfigFormValues = {
  title?: string;
  description?: string;
  assignee?: string;
  dueDate?: string;
  approverRole?: "Manager" | "HRBP" | "Director" | "VP" | "CEO";
  autoApproveThreshold?: number;
  action?: string;
  endMessage?: string;
  summaryFlag?: boolean;
  metadata?: { key: string; value: string }[];
  customFields?: { key: string; value: string }[];
  params?: { key: string; value: string }[];
};

export function NodeConfigPanel({ selectedNode, updateNodeConfig }: NodeConfigPanelProps) {
  const { automations, loading } = useNodeConfig();
  const form = useForm<ConfigFormValues>({
    mode: "onChange",
    defaultValues: {},
  });
  const { register, watch, reset, setValue, handleSubmit, control } = form;

  useEffect(() => {
    if (!selectedNode) {
      reset({});
      return;
    }
    reset(nodeConfigToFormValues(selectedNode));
  }, [selectedNode, reset]);

  const actionId = useWatch({ control, name: "action" });

  useEffect(() => {
    if (!selectedNode || selectedNode.data.nodeType !== "automated") {
      return;
    }

    const action = automations.find((item) => item.id === actionId);
    if (!action) {
      setValue("params", []);
      return;
    }

    const existingParams = form.getValues("params") ?? [];
    const params = action.params.map((param) => {
      const existing = existingParams.find((p) => p.key === param);
      return { key: param, value: existing?.value ?? "" };
    });
    setValue("params", params);
  }, [actionId, automations, form, selectedNode, setValue]);

  if (!selectedNode) {
    return (
      <aside className="config-panel">
        <h3>Node Configuration</h3>
        <p className="panel-subtext">Select a node to edit its settings.</p>
      </aside>
    );
  }

  const submitForm = handleSubmit((values) => {
    const config = mapFormValuesToConfig(
      selectedNode.data.nodeType,
      values,
      selectedNode.data.config,
    );
    updateNodeConfig(selectedNode.id, config);
  });

  const selectedAction = automations.find((item) => item.id === actionId);

  return (
    <aside className="config-panel">
      <h3>Node Configuration</h3>
      <p className="panel-subtext">Editing: {selectedNode.data.label}</p>

      <form onChange={submitForm} className="config-form">
        {selectedNode.data.nodeType === "start" && (
          <>
            <label>Title *</label>
            <input {...register("title")} />
            <KeyValueEditor
              label="Metadata"
              register={register}
              fieldName="metadata"
              watch={watch}
              setValue={setValue}
            />
          </>
        )}

        {selectedNode.data.nodeType === "task" && (
          <>
            <label>Title *</label>
            <input placeholder="Enter task title" {...register("title", { required: true })} />
            <label>Description</label>
            <textarea placeholder="Enter task description" {...register("description")} rows={3} />
            <label>Assignee</label>
            <input placeholder="Enter assignee name or email" {...register("assignee")} />
            <label>Due Date</label>
            <input type="date" {...register("dueDate")} />
            <KeyValueEditor
              label="Custom Fields"
              register={register}
              fieldName="customFields"
              watch={watch}
              setValue={setValue}
            />
          </>
        )}

        {selectedNode.data.nodeType === "approval" && (
          <>
            <label>Title</label>
            <input placeholder="Enter approval step title" {...register("title")} />
            <label>Approver Role</label>
            <select {...register("approverRole")}>
              <option value="Manager">Manager</option>
              <option value="HRBP">HRBP</option>
              <option value="Director">Director</option>
              <option value="VP">VP</option>
              <option value="CEO">CEO</option>
            </select>
            <label>Auto Approve Threshold</label>
            <input
              type="number"
              placeholder="Enter threshold value"
              {...register("autoApproveThreshold", { valueAsNumber: true })}
            />
            <small className="field-help">
              Automatically approve if amount is below this threshold
            </small>
          </>
        )}

        {selectedNode.data.nodeType === "automated" && (
          <>
            <label>Title *</label>
            <input placeholder="Enter automation step title" {...register("title")} />
            <label>Action *</label>
            <select {...register("action")}>
              <option value="">Select action</option>
              {automations.map((action) => (
                <option key={action.id} value={action.id}>
                  {action.label}
                </option>
              ))}
            </select>
            {loading && <small>Loading automation actions...</small>}
            {selectedAction && (
              <KeyValueEditor
                label="Parameters"
                register={register}
                fieldName="params"
                watch={watch}
                setValue={setValue}
                fixedKeys
                stacked
              />
            )}
          </>
        )}

        {selectedNode.data.nodeType === "end" && (
          <>
            <label>End Message</label>
            <input placeholder="Enter completion message" {...register("endMessage")} />
            <label className="checkbox-label summary-option">
              <input
                type="checkbox"
                {...register("summaryFlag")}
                onClick={() => {
                  setTimeout(() => {
                    submitForm();
                  }, 0);
                }}
              />
              <span>
                <strong>Generate Summary</strong>
                <small>Include a summary report when workflow completes</small>
              </span>
            </label>
          </>
        )}
      </form>
    </aside>
  );
}

function KeyValueEditor({
  label,
  register,
  fieldName,
  watch,
  setValue,
  fixedKeys,
  stacked,
}: {
  label: string;
  register: ReturnType<typeof useForm<ConfigFormValues>>["register"];
  fieldName: "metadata" | "customFields" | "params";
  watch: ReturnType<typeof useForm<ConfigFormValues>>["watch"];
  setValue: ReturnType<typeof useForm<ConfigFormValues>>["setValue"];
  fixedKeys?: boolean;
  stacked?: boolean;
}) {
  const items = watch(fieldName) ?? [{ key: "", value: "" }];
  const addRow = () => {
    setValue(fieldName, [...items, { key: "", value: "" }], { shouldDirty: true });
  };

  return (
    <div className="kv-editor">
      <label>{label}</label>
      {items.map((_, idx) => (
        <div key={`${fieldName}-${idx}`} className={`kv-row ${stacked ? "stacked" : ""}`}>
          {fixedKeys ? (
            <>
              <span className="kv-key">{items[idx]?.key || "param"}</span>
              <input type="hidden" {...register(`${fieldName}.${idx}.key`)} />
            </>
          ) : (
            <input placeholder="Enter key" {...register(`${fieldName}.${idx}.key`)} />
          )}
          <input
            type={resolveInputType(items[idx]?.key)}
            placeholder={resolvePlaceholder(items[idx]?.key)}
            {...register(`${fieldName}.${idx}.value`)}
          />
        </div>
      ))}
      {!fixedKeys && (
        <button type="button" onClick={addRow}>
          + Add {label.slice(0, -1)}
        </button>
      )}
    </div>
  );
}

function nodeConfigToFormValues(node: WorkflowNode): ConfigFormValues {
  const { config } = node.data;
  switch (node.data.nodeType) {
    case "start": {
      const value = config as WorkflowNodeConfigByType["start"];
      return {
        title: value.title,
        metadata: mapRecordToArray(value.metadata),
      };
    }
    case "task": {
      const value = config as WorkflowNodeConfigByType["task"];
      return {
        title: value.title,
        description: value.description,
        assignee: value.assignee,
        dueDate: value.dueDate,
        customFields: mapRecordToArray(value.customFields),
      };
    }
    case "approval": {
      const value = config as WorkflowNodeConfigByType["approval"];
      return {
        title: value.title,
        approverRole: value.approverRole,
        autoApproveThreshold: value.autoApproveThreshold,
      };
    }
    case "automated": {
      const value = config as WorkflowNodeConfigByType["automated"];
      return {
        title: value.title,
        action: value.action,
        params: mapRecordToArray(value.params),
      };
    }
    case "end": {
      const value = config as WorkflowNodeConfigByType["end"];
      return {
        endMessage: value.endMessage,
        summaryFlag: value.summaryFlag,
      };
    }
    default:
      return {};
  }
}

function mapFormValuesToConfig(
  nodeType: WorkflowNodeType,
  values: ConfigFormValues,
  fallbackConfig: WorkflowNode["data"]["config"],
): WorkflowNode["data"]["config"] {
  switch (nodeType) {
    case "start":
      return {
        title: values.title ?? "",
        metadata: mapArrayToRecord(values.metadata),
      };
    case "task":
      return {
        title: values.title ?? "",
        description: values.description ?? "",
        assignee: values.assignee ?? "",
        dueDate: values.dueDate ?? "",
        customFields: mapArrayToRecord(values.customFields),
      };
    case "approval":
      return {
        title: values.title ?? "",
        approverRole: values.approverRole ?? "Manager",
        autoApproveThreshold: Number.isFinite(values.autoApproveThreshold)
          ? Number(values.autoApproveThreshold)
          : 0,
      };
    case "automated":
      return {
        title: values.title ?? "",
        action: values.action ?? "",
        params: mapArrayToRecord(values.params),
      } satisfies AutomatedNodeConfig;
    case "end":
      return {
        endMessage: values.endMessage ?? "",
        summaryFlag: Boolean(values.summaryFlag),
      };
    default:
      return fallbackConfig as WorkflowNodeConfigByType[keyof WorkflowNodeConfigByType];
  }
}

function mapRecordToArray(record: Record<string, string>): { key: string; value: string }[] {
  const entries = Object.entries(record);
  if (entries.length === 0) {
    return [{ key: "", value: "" }];
  }
  return entries.map(([key, value]) => ({ key, value }));
}

function mapArrayToRecord(
  values?: { key?: string; value?: string }[],
): Record<string, string> {
  const output: Record<string, string> = {};
  values?.forEach((item) => {
    if (item.key?.trim()) {
      output[item.key.trim()] = item.value?.trim() ?? "";
    }
  });
  return output;
}

function resolveInputType(paramKey?: string): "text" | "date" {
  if (paramKey?.toLowerCase() === "date") {
    return "date";
  }
  return "text";
}

function resolvePlaceholder(paramKey?: string): string {
  const normalized = paramKey?.toLowerCase() ?? "";
  const placeholderMap: Record<string, string> = {
    to: "Enter to",
    subject: "Enter subject",
    body: "Enter body",
    template: "Enter template",
    recipient: "Enter recipient",
    title: "Enter title",
    date: "",
    attendees: "Enter attendees",
    employee_id: "Enter employee id",
    field: "Enter field",
    value: "Enter value",
    channel: "Enter channel",
    message: "Enter message",
  };

  return placeholderMap[normalized] ?? "Enter value";
}

