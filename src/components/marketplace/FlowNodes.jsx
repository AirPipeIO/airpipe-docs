import React from "react";
import { Handle, Position } from "@xyflow/react";
import {
  IconApi, IconClock, IconTerminal, IconMail, IconDatabase,
  IconGitBranch, IconRepeat, IconSettings, IconBolt, IconChartBar,
  IconTestPipe, IconTransform, IconPlus,
} from "@tabler/icons-react";

// Read-only flow nodes styled to match app-airpipe-react's WorkflowEditor:
// gradient-border wrapper -> dark inner -> header (title + type badge) ->
// body (input + description) -> footer (assertion/transform chips with counts).
// Handle IDs must match the converter: sources bottom-left/center/right,
// targets top-center + right-center.

const METHOD_COLOR = { GET: "#2a8af6", POST: "#10b981", PUT: "#f59e0b", PATCH: "#8b5cf6", DELETE: "#e92a67" };

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

// Gradient-border shell: 2px gradient frame around a dark inner card.
function Shell({ gradient, width = 280, children }) {
  return (
    <div style={{ minWidth: width, maxWidth: width + 40, borderRadius: 13, padding: 2, background: gradient, boxShadow: "0 10px 25px -12px rgba(0,0,0,0.7)" }}>
      <div style={{ background: "#1a1a1a", borderRadius: 11, overflow: "hidden" }}>{children}</div>
    </div>
  );
}

function Chip({ active, color, Icon, children }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600,
      padding: "2px 8px", borderRadius: 6,
      color: active ? color : "#6b7280",
      background: active ? `${color}1f` : "transparent",
      border: `1px solid ${active ? `${color}55` : "#2e3036"}`,
    }}>
      <Icon size={12} /> {children}
    </span>
  );
}

export function InterfaceNode({ data }) {
  const isSchedule = !!data?.schedule;
  const method = (data?.method || "GET").toUpperCase();
  const accent = isSchedule ? "#a855f7" : (METHOD_COLOR[method] || "#2a8af6");
  return (
    <Shell gradient="linear-gradient(135deg, #228be6, #40c057)" width={230}>
      {tgtHandles}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 14px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <span style={{ display: "inline-flex", width: 26, height: 26, borderRadius: 7, alignItems: "center", justifyContent: "center", background: `${accent}22`, color: accent, flexShrink: 0 }}>
          {isSchedule ? <IconClock size={15} /> : <IconApi size={15} />}
        </span>
        <strong style={{ fontSize: 13.5, color: "#f8f9fa", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{data?.interfaceName}</strong>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", background: accent, padding: "2px 7px", borderRadius: 5 }}>
          {isSchedule ? "CRON" : method}
        </span>
      </div>
      {data?.route ? (
        <div style={{ padding: "7px 14px", fontSize: 11.5, color: "#9ca3af", fontFamily: "var(--ifm-font-family-monospace)" }}>{data.route}</div>
      ) : null}
      {srcHandles}
    </Shell>
  );
}

export function ActionNode({ data }) {
  const a = data?.action || {};
  const info = actionTypeInfo(a);
  const assertions = a.assert?.tests?.length || 0;
  const transforms = a.post_transforms?.length || 0;
  const input = a.input;
  const desc = a.description;
  return (
    <Shell gradient={`linear-gradient(135deg, ${info.color}, ${info.color}44)`} width={264}>
      {tgtHandles}
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 14px 8px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <span style={{ display: "inline-flex", width: 24, height: 24, borderRadius: 6, alignItems: "center", justifyContent: "center", background: `${info.color}22`, color: info.color, flexShrink: 0 }}>
          <info.Icon size={14} />
        </span>
        <strong style={{ fontSize: 13.5, color: "#f8f9fa", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "left" }}>{data?.label}</strong>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", background: info.color, padding: "2px 7px", borderRadius: 5 }}>{info.type}</span>
      </div>
      {/* body */}
      {(input || desc) ? (
        <div style={{ padding: "8px 14px", fontSize: 11.5, color: "#9ca3af", lineHeight: 1.45, textAlign: "left" }}>
          {input ? <div style={{ fontFamily: "var(--ifm-font-family-monospace)" }}><span style={{ color: "#c9cbcf" }}>input:</span> {String(input).slice(0, 40)}</div> : null}
          {desc ? <div style={{ marginTop: input ? 2 : 0 }}>{String(desc).slice(0, 60)}</div> : null}
        </div>
      ) : null}
      {/* footer */}
      <div style={{ display: "flex", gap: 6, padding: "8px 14px 10px" }}>
        <Chip active={assertions > 0} color="#f59e0b" Icon={IconTestPipe}>
          {assertions > 0 ? `${assertions} assertion${assertions !== 1 ? "s" : ""}` : "Assertions"}
        </Chip>
        <Chip active={transforms > 0} color="#22c55e" Icon={IconTransform}>
          {transforms > 0 ? `${transforms} transform${transforms !== 1 ? "s" : ""}` : "Transforms"}
        </Chip>
      </div>
      {srcHandles}
    </Shell>
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
