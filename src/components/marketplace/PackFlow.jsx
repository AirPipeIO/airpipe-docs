import React, { useMemo } from "react";
import { ReactFlow, ReactFlowProvider, Background, Controls } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { load as loadYaml } from "js-yaml";
import convertConfigToReactFlow from "./convert-with-dagre";
import { nodeTypes } from "./FlowNodes";

// Renders an Air Pipe config YAML as a read-only ReactFlow workflow diagram.
// Import this ONLY from inside a <BrowserOnly> — @xyflow/react touches window /
// ResizeObserver and cannot be server-rendered.
export default function PackFlow({ yaml: yamlText, height = 460 }) {
  const { nodes, edges, error } = useMemo(() => {
    try {
      const config = loadYaml(yamlText) || {};
      if (!config.interfaces || typeof config.interfaces !== "object") {
        return { nodes: [], edges: [], error: "No interfaces in this config." };
      }
      const flow = convertConfigToReactFlow(config, 1200, height) || {};
      return { nodes: flow.nodes || [], edges: flow.edges || [], error: null };
    } catch (e) {
      return { nodes: [], edges: [], error: String(e.message || e) };
    }
  }, [yamlText, height]);

  if (error) {
    return (
      <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center", color: "#909296" }}>
        Could not render workflow: {error}
      </div>
    );
  }

  return (
    <div style={{ height, width: "100%", borderRadius: 10, overflow: "hidden", border: "1px solid #2a2c2f" }}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          colorMode="dark"
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          proOptions={{ hideAttribution: true }}
          minZoom={0.1}
        >
          <Background color="#2a2c2f" gap={18} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}
