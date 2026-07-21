import React, { useMemo } from "react";
import { ReactFlow, ReactFlowProvider, Background } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { load as loadYaml } from "js-yaml";
import { convertModuleToReactFlow } from "./convert-with-dagre";
import { nodeTypes } from "./FlowNodes";

// Renders a STANDALONE Air Pipe module spec — a bare typed spec (Database / Assert /
// Action / NetworkPolicy / Schedule), NOT a full config — as a single module node.
// Import ONLY from inside <BrowserOnly> — @xyflow/react needs the DOM.
export default function ModuleFlow({ type, yaml: yamlText, height = 220 }) {
  const { nodes, edges, error } = useMemo(() => {
    try {
      const spec = loadYaml(yamlText) || {};
      const flow = convertModuleToReactFlow(type, spec, 900, 600) || {};
      // Strip the converter's inline node.style — our custom nodes carry their own look.
      const nodes = (flow.nodes || []).map(({ style, ...n }) => n);
      return { nodes, edges: flow.edges || [], error: null };
    } catch (e) {
      return { nodes: [], edges: [], error: String(e.message || e) };
    }
  }, [type, yamlText]);

  if (error) {
    return (
      <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center", color: "#5c5f66", fontSize: 13 }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ height, width: "100%" }}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          colorMode="dark"
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          panOnScroll={false}
          preventScrolling={false}
          proOptions={{ hideAttribution: true }}
          minZoom={0.05}
        >
          <Background color="#2a2c2f" gap={18} />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}
