import React from "react";
import { Handle, Position } from "@xyflow/react";

// Generic read-only nodes for the pack workflow preview. The converter
// (convert-with-dagre.js) sets node.type to one of several strings and puts the
// visual color in node.style; we collapse them to two components. Handle IDs
// MUST match what the converter's edges reference, or edges silently detach:
//   sources: bottom-left, bottom-center, bottom-right
//   targets: top-center, right-center

const srcHandles = (
  <>
    <Handle type="source" position={Position.Bottom} id="bottom-left" style={{ left: "20%" }} />
    <Handle type="source" position={Position.Bottom} id="bottom-center" style={{ left: "50%" }} />
    <Handle type="source" position={Position.Bottom} id="bottom-right" style={{ left: "80%" }} />
  </>
);

const tgtHandles = (
  <>
    <Handle type="target" position={Position.Top} id="top-center" style={{ left: "50%" }} />
    <Handle type="target" position={Position.Right} id="right-center" style={{ top: "50%" }} />
  </>
);

export function InterfaceNode({ data }) {
  const method = (data?.method || "GET").toUpperCase();
  return (
    <div
      style={{
        minWidth: 220,
        padding: "10px 14px",
        borderRadius: 10,
        background: "linear-gradient(135deg, #1f2937, #111827)",
        border: "1px solid #374151",
        color: "#f9fafb",
        textAlign: "center",
      }}
    >
      {tgtHandles}
      <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            padding: "1px 7px",
            borderRadius: 5,
            background: data?.schedule ? "#7c3aed" : "#2563eb",
          }}
        >
          {data?.schedule ? "SCHEDULE" : method}
        </span>
        <strong style={{ fontSize: 13 }}>{data?.interfaceName}</strong>
      </div>
      {data?.route ? (
        <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{data.route}</div>
      ) : null}
      {srcHandles}
    </div>
  );
}

export function ActionNode({ data, style }) {
  return (
    <div
      style={{
        minWidth: 200,
        maxWidth: 260,
        padding: "10px 14px",
        borderRadius: 8,
        fontWeight: 500,
        textAlign: "center",
        background: style?.backgroundColor || "#e2e8f0",
        color: style?.color || "#000",
        border: "1px solid rgba(255,255,255,0.12)",
        ...style,
      }}
    >
      {tgtHandles}
      {data?.label}
      {srcHandles}
    </div>
  );
}

// Every converter node-type string -> a component (incl. `command`/`email`,
// which the app never registered).
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
