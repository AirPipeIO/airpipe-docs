import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Handle, Position, BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from "@xyflow/react";
import { dump as dumpYaml } from "js-yaml";
import {
  IconApi, IconClock, IconTerminal, IconMail, IconDatabase,
  IconGitBranch, IconRepeat, IconSettings, IconBolt, IconChartBar,
  IconTestPipe, IconTransform, IconPlus, IconStack2,
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

// Drop the converter's internal __module* tags before previewing a module spec.
function cleanSpec(value) {
  if (Array.isArray(value)) return value.map(cleanSpec);
  if (value && typeof value === "object") {
    const out = {};
    for (const key of Object.keys(value)) {
      if (key.startsWith("__")) continue;
      out[key] = cleanSpec(value[key]);
    }
    return out;
  }
  return value;
}

// A module chip that reveals the referenced module's spec (assertion tests, connection,
// inlined action) in a hover popover, so a config shows WHAT a module does, not just its name.
function ModuleChip({ label, handle, moduleType, spec }) {
  const [rect, setRect] = useState(null);
  const ref = useRef(null);
  let body = "";
  if (spec && typeof spec === "object") {
    try { body = dumpYaml(cleanSpec(spec), { lineWidth: 60, noRefs: true }); } catch { body = ""; }
  }
  const show = () => { const r = ref.current?.getBoundingClientRect(); if (r) setRect({ left: r.left, top: r.top }); };
  const hide = () => setRect(null);
  // Portaled to <body> and fixed-positioned so the node's overflow:hidden can't clip it.
  const popover = rect && typeof document !== "undefined" && createPortal(
    <div style={{
      position: "fixed", left: Math.max(8, Math.min(rect.left, window.innerWidth - 320)),
      top: rect.top - 8, transform: "translateY(-100%)", zIndex: 9999, width: 300,
      background: "#1b1b1d", border: "1px solid #34343a", borderRadius: 8, padding: 10,
      boxShadow: "0 12px 34px rgba(0,0,0,0.6)", textAlign: "left", pointerEvents: "none",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: body ? 6 : 0 }}>
        <IconStack2 size={13} color="#c4a7ff" />
        <strong style={{ fontSize: 12, color: "#f1f1f3", flex: 1 }}>{handle}</strong>
        {moduleType ? (
          <span style={{ fontSize: 10, color: "#c4a7ff", border: "1px solid #4b3b7a", borderRadius: 5, padding: "1px 6px" }}>{moduleType}</span>
        ) : null}
      </div>
      {body ? (
        <pre style={{ margin: 0, fontSize: 10.5, lineHeight: 1.45, color: "#c9cbcf", maxHeight: 220, overflow: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: "var(--ifm-font-family-monospace, monospace)" }}>{body}</pre>
      ) : (
        <span style={{ fontSize: 11, color: "#8b8f96" }}>a|module::{handle}| — definition not available in this view.</span>
      )}
    </div>,
    document.body
  );
  return (
    // pointerEvents:auto re-enables hover on the chip even though React Flow sets
    // pointer-events:none on the (non-selectable, read-only) node it lives in.
    <span ref={ref} style={{ display: "inline-flex", cursor: "help", pointerEvents: "auto" }} onMouseEnter={show} onMouseLeave={hide}>
      <Chip active color="#a855f7" Icon={IconStack2}>{label}</Chip>
      {popover}
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
      {(data?.assertModule || data?.networkModule) && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", padding: "0 14px 9px" }}>
          {data.assertModule ? <Chip active color="#a855f7" Icon={IconStack2}>auth · {data.assertModule}</Chip> : null}
          {data.networkModule ? <Chip active color="#a855f7" Icon={IconStack2}>net · {data.networkModule}</Chip> : null}
        </div>
      )}
      {srcHandles}
    </Shell>
  );
}

export function ActionNode({ data }) {
  const a = data?.action || {};
  const isModule = !!data?.isModule;
  const moduleHandle = data?.moduleHandle;
  let info = isModule
    ? { type: data?.moduleType ? `Module · ${data.moduleType}` : "Module", Icon: IconStack2, color: "#7c3aed" }
    : actionTypeInfo(a);
  // Match the app's databaseActionNode — show the resolved driver (e.g. PostgreSQL) with
  // its brand colour instead of a generic cyan "Database".
  if (!isModule && (a.database || a.query || a.document_operation)) {
    const drv = String(data?.connDriver || (a.database && typeof a.database === "object" ? a.database.driver : "") || "").toLowerCase();
    const DB = { postgres: ["PostgreSQL", "#336791"], postgresql: ["PostgreSQL", "#336791"], mysql: ["MySQL", "#e97627"], mssql: ["SQL Server", "#cc2927"], sqlserver: ["SQL Server", "#cc2927"], sqlite: ["SQLite", "#0f6a8b"], mongodb: ["MongoDB", "#10aa50"] };
    if (DB[drv]) info = { ...info, type: DB[drv][0], color: DB[drv][1] };
  }
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
      {/* module-backed refs: whole action inlined from a module, or its assert / db connection.
          Each chip hover-previews the referenced module's spec. */}
      {(data?.moduleSource || data?.connModule || data?.assertModule) && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", padding: "8px 14px 0" }}>
          {data.moduleSource ? <ModuleChip label={`module · ${data.moduleSource}`} handle={data.moduleSource} spec={data.moduleSourceSpec} /> : null}
          {data.connModule ? <ModuleChip label={`db · ${data.connModule}`} handle={data.connModule} moduleType="Database" spec={data.connModuleSpec} /> : null}
          {data.assertModule ? <ModuleChip label={`auth · ${data.assertModule}`} handle={data.assertModule} moduleType="Assert" spec={data.assertModuleSpec} /> : null}
        </div>
      )}
      {/* body */}
      {isModule ? (
        <div style={{ padding: "8px 14px", fontSize: 11.5, color: "#9ca3af", lineHeight: 1.45, textAlign: "left" }}>
          {moduleHandle
            ? <div style={{ fontFamily: "var(--ifm-font-family-monospace)", color: "#c9cbcf" }}>a|module::{moduleHandle}|</div>
            : <div>{desc ? String(desc).slice(0, 60) : "Reusable module — referenced by handle across configs."}</div>}
        </div>
      ) : (input || desc) ? (
        <div style={{ padding: "8px 14px", fontSize: 11.5, color: "#9ca3af", lineHeight: 1.45, textAlign: "left" }}>
          {input ? <div style={{ fontFamily: "var(--ifm-font-family-monospace)" }}><span style={{ color: "#c9cbcf" }}>input:</span> {String(input).slice(0, 40)}</div> : null}
          {desc ? <div style={{ marginTop: input ? 2 : 0 }}>{String(desc).slice(0, 60)}</div> : null}
        </div>
      ) : null}
      {/* footer — hidden only for a collapsed inline module ref (no content) */}
      {!(isModule && data?.moduleHandle) && (
      <div style={{ display: "flex", gap: 6, padding: "8px 14px 10px" }}>
        <Chip active={assertions > 0} color="#f59e0b" Icon={IconTestPipe}>
          {assertions > 0 ? `${assertions} assertion${assertions !== 1 ? "s" : ""}` : "Assertions"}
        </Chip>
        <Chip active={transforms > 0} color="#22c55e" Icon={IconTransform}>
          {transforms > 0 ? `${transforms} transform${transforms !== 1 ? "s" : ""}` : "Transforms"}
        </Chip>
      </div>
      )}
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

// Edge-label colours matched to the app config editor's ConditionEdge pills, keyed off
// the converter's summary text. Readable light-pill-on-dark instead of the default
// white-on-white the built-in edge produced.
function labelColors(label) {
  const l = String(label || "").toLowerCase();
  if (l.startsWith("⚙️") || /\d+\s*condition|\+/.test(l)) return { bg: "#3a2e12", fg: "#fcd34d", bd: "#a16207" };
  if (l.includes("success")) return { bg: "#0f3f30", fg: "#6ee7b7", bd: "#10b981" };
  if (l.includes("failure")) return { bg: "#43191b", fg: "#fca5a5", bd: "#ef4444" };
  if (l.includes("finished")) return { bg: "#2b2350", fg: "#c4b5fd", bd: "#8b5cf6" };
  if (l.includes("depends")) return { bg: "#152a4e", fg: "#93c5fd", bd: "#3b82f6" };
  if (l.includes("assertion")) return { bg: "#3a2e12", fg: "#fcd34d", bd: "#f59e0b" };
  if (l.includes("conditional")) return { bg: "#2b2350", fg: "#c4b5fd", bd: "#8b5cf6" };
  if (l.includes("iteration") || l.includes("for each")) return { bg: "#3a2610", fg: "#fbbf24", bd: "#d97706" };
  return { bg: "#20242b", fg: "#cbd5e1", bd: "#475569" };
}

// Read-only edge: the path + a readable label pill (no editing, unlike the app's ConditionEdge).
function FlowEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style, markerEnd, label }) {
  const [path, lx, ly] = getSmoothStepPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  const c = label ? labelColors(label) : null;
  return (
    <>
      <BaseEdge id={id} path={path} style={style} markerEnd={markerEnd} />
      {label && c ? (
        <EdgeLabelRenderer>
          <div style={{
            position: "absolute", transform: `translate(-50%,-50%) translate(${lx}px,${ly}px)`,
            background: c.bg, color: c.fg, border: `1px solid ${c.bd}`, borderRadius: 6,
            padding: "2px 8px", fontSize: 10.5, fontWeight: 600, whiteSpace: "nowrap",
            pointerEvents: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
          }}>{label}</div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}

export const edgeTypes = {
  smoothstep: FlowEdge,
  default: FlowEdge,
};
