import React, { useMemo } from "react";
import { ReactFlow, ReactFlowProvider, Background, Controls } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { load as loadYaml } from "js-yaml";
import convertConfigToReactFlow from "./convert-with-dagre";
import { nodeTypes } from "./FlowNodes";

// Renders an Air Pipe config YAML as a ReactFlow workflow diagram.
// Import ONLY from inside <BrowserOnly> — @xyflow/react needs the DOM.
//   thumbnail=true  -> static, non-interactive preview (for the slider)
//   thumbnail=false -> interactive (lightbox): pan/zoom + controls
export default function PackFlow({ yaml: yamlText, height = 460, thumbnail = false }) {
  const { nodes, edges, error } = useMemo(() => {
    try {
      const config = loadYaml(yamlText) || {};
      if (!config.interfaces || typeof config.interfaces !== "object") {
        return { nodes: [], edges: [], error: "No interfaces in this config." };
      }
      const flow = convertConfigToReactFlow(config, 1200, 800) || {};
      // Strip the converter's inline node.style (a white background + padding it
      // sets for the app's built-in nodes) — our custom nodes carry their own look.
      const nodes = (flow.nodes || []).map(({ style, ...n }) => n);
      return { nodes, edges: flow.edges || [], error: null };
    } catch (e) {
      return { nodes: [], edges: [], error: String(e.message || e) };
    }
  }, [yamlText]);

  if (error) {
    return (
      <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center", color: "#5c5f66", fontSize: 13 }}>
        {error}
      </div>
    );
  }

  const interactive = !thumbnail;
  return (
    <div style={{ height, width: "100%" }}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: thumbnail ? 0.12 : 0.2 }}
          colorMode="dark"
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag={interactive}
          zoomOnScroll={interactive}
          zoomOnPinch={interactive}
          zoomOnDoubleClick={interactive}
          panOnScroll={false}
          preventScrolling={interactive}
          proOptions={{ hideAttribution: true }}
          minZoom={0.05}
        >
          <Background color="#2a2c2f" gap={18} />
          {interactive ? <Controls showInteractive={false} /> : null}
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}
