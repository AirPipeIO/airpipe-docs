import React from "react";
import { Handle, Position } from "@xyflow/react";
import {
  IconApi, IconClock, IconTerminal, IconMail, IconDatabase,
  IconGitBranch, IconRepeat, IconSettings, IconBolt, IconChartBar,
  IconTestPipe, IconTransform, IconArrowRight,
} from "@tabler/icons-react";

// Read-only flow nodes styled to match app-airpipe-react's WorkflowEditor.
// Handle IDs must match the converter's edges: sources bottom-left/center/right,
// targets top-center + right-center.

const METHOD_COLOR = {
  GET: "#2a8af6", POST: "#10b981", PUT: "#f59e0b", PATCH: "#8b5cf6", DELETE: "#e92a67",
};

function actionTypeInfo(action = {}) {
  if (action.conditional_input?.length) return { type: "Conditional", Icon: IconGitBranch, color: "#8b5cf6" };
  if (action.http) return { type: "HTTP", Icon: IconApi, color: "#3b82f6" };
  if (action.command) return { type: "Command", Icon: IconTerminal, color: "#10b981" };
  if (action.email) return { type: "Email", Icon: IconMail, color: "#8b5cf6" };
  if (action.database || action.query || action.document_operation) return { type: "Database", Icon: IconDatabase, color: "#06b6d4" };
  if (action.state) return { type: "State", Icon: IconBolt, color: "#eab308" };
  if (action.emit_metric) return { type: "Metric", Icon: IconChartBar, color: "#14b8a6" };
  if (action.lookup) return { type: "Loop", Icon: IconRepeat, color: "#d97706" };
  return { type: "Action", Icon: IconSettings, color: "#6b7280" };
}

const srcHandles = (
  <>
    <Handle type="source" position={Position.Bottom} id="bottom-left" style={{ left: "22%" }} />
    <Handle type="source" position={Position.Bottom} id="bottom-center" style={{ left: "50%" }} />
    <Handle type="source" position={Position.Bottom} id="bottom-right" style={{ left: "78%" }} />
  </>
);
const tgtHandles = (
  <>
    <Handle type="target" position={Position.Top} id="top-center" style={{ left: "50%" }} />
    <Handle type="target" position={Position.Right} id="right-center" style={{ top: "50%" }} />
  </>
);

export function InterfaceNode({ data }) {
  const isSchedule = !!data?.schedule;
  const method = (data?.method || "GET").toUpperCase();
  const accent = isSchedule ? "#a855f7" : (METHOD_COLOR[method] || "#2a8af6");
  return (
    <div style={{ minWidth: 210, borderRadius: 12, padding: 1.5, background: "linear-gradient(135deg, #228be6, #40c057)", boxShadow: "0 6px 20px -8px rgba(0,0,0,0.6)" }}>
      {tgtHandles}
      <div style={{ borderRadius: 11, background: "#16171a", padding: "10px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ display: "inline-flex", width: 26, height: 26, borderRadius: 7, alignItems: "center", justifyContent: "center", background: `${accent}22`, color: accent }}>
            {isSchedule ? <IconClock size={15} /> : <IconApi size={15} />}
          </span>
          <strong style={{ fontSize: 13, color: "#f9fafb", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{data?.interfaceName}</strong>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", background: accent, padding: "1px 6px", borderRadius: 5 }}>
            {isSchedule ? "CRON" : method}
          </span>
        </div>
        {data?.route ? <div style={{ fontSize: 11, color: "#8b8f96", marginTop: 3, fontFamily: "var(--ifm-font-family-monospace)" }}>{data.route}</div> : null}
      </div>
      {srcHandles}
    </div>
  );
}

export function ActionNode({ data }) {
  const info = actionTypeInfo(data?.action || {});
  const a = data?.action || {};
  const hasAssert = (a.assert?.tests || []).length > 0;
  const hasTransform = (a.post_transforms || []).length > 0;
  const input = a.input;
  return (
    <div style={{ minWidth: 210, maxWidth: 264, borderRadius: 10, background: "#1c1d20", border: "1px solid #2e3036", borderLeft: `3px solid ${info.color}`, padding: "9px 12px", boxShadow: "0 4px 14px -8px rgba(0,0,0,0.6)" }}>
      {tgtHandles}
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
        <span style={{ display: "inline-flex", width: 22, height: 22, borderRadius: 6, alignItems: "center", justifyContent: "center", background: `${info.color}22`, color: info.color, flexShrink: 0 }}>
          <info.Icon size={14} />
        </span>
        <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em", color: info.color }}>{info.type}</span>
        <span style={{ flex: 1 }} />
        {hasAssert ? <IconTestPipe size={13} style={{ color: "#f59e0b" }} title="has assertions" /> : null}
        {hasTransform ? <IconTransform size={13} style={{ color: "#22c55e" }} title="has transforms" /> : null}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f3f5", lineHeight: 1.25 }}>{data?.label}</div>
      {input ? (
        <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 3, fontSize: 10.5, color: "#8b8f96", fontFamily: "var(--ifm-font-family-monospace)" }}>
          <IconArrowRight size={11} /> {String(input).slice(0, 28)}
        </div>
      ) : null}
      {srcHandles}
    </div>
  );
}

export const nodeTypes = {
  httpInterface: InterfaceNode,
  scheduleInterface: InterfaceNode,
  httpActionNode: ActionNode,
  conditionalNode: ActionNode,
  databaseActionNode: ActionNode,
  defaultActionNode: ActionNode,
  lookupSubflowNode: ActionNode,
  command: ActionNode,
  email: ActionNode,
};
