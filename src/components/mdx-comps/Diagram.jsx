import React from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";

// SSR-safe wrappers for embedding the workflow visualizer inside docs pages.
// @xyflow/react needs the DOM, so the actual renderers are required lazily inside
// <BrowserOnly>.

const frame = (height) => ({
  height,
  width: "100%",
  border: "1px solid var(--ifm-color-emphasis-200)",
  borderRadius: 10,
  overflow: "hidden",
  background: "#161616"
});

const skeleton = (height) => (
  <div
    style={{
      ...frame(height),
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#5c5f66",
      fontSize: 13
    }}
  >
    Loading diagram…
  </div>
);

// Render a STANDALONE module spec (bare typed spec) as a single module node.
export function ModuleDiagram({ type, yaml, height = 220 }) {
  return (
    <div style={frame(height)}>
      <BrowserOnly fallback={skeleton(height)}>
        {() => {
          const ModuleFlow =
            require("@site/src/components/marketplace/ModuleFlow").default;
          return <ModuleFlow type={type} yaml={yaml} height={height} />;
        }}
      </BrowserOnly>
    </div>
  );
}

// Render a full config — used to show module references (a|module::…|) resolved and
// unpacked inside a real workflow. Pass `modules` ({ handle: { type, spec } }) so the
// referencing actions show the module's real content + a hover-preview chip.
export function ConfigDiagram({ yaml, modules, height = 460 }) {
  return (
    <div style={frame(height)}>
      <BrowserOnly fallback={skeleton(height)}>
        {() => {
          const PackFlow =
            require("@site/src/components/marketplace/PackFlow").default;
          return <PackFlow yaml={yaml} modules={modules} height={height} />;
        }}
      </BrowserOnly>
    </div>
  );
}
