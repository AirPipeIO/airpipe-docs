import React from "react";
import { resolvePackIcons } from "./packIcon";

// Ported from app-airpipe-react PackIcon; Mantine Tooltip -> title attr,
// Mantine color vars -> docs hex tokens.
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function IconCircle({ resolved, circleSize, borderOverlap }) {
  const iconSize = Math.round(circleSize * 0.52);
  const isSi = resolved.type === "si";
  const hex = isSi ? resolved.icon.hex : null;
  const bg = hex ? hexToRgba(hex, 0.18) : "#242527";
  const border = hex ? `1.5px solid ${hexToRgba(hex, 0.45)}` : "1.5px solid #33353a";

  return (
    <div
      title={resolved.label}
      style={{
        width: circleSize,
        height: circleSize,
        borderRadius: "50%",
        background: bg,
        border,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxShadow: `0 0 0 ${borderOverlap}px #1b1c1d`,
      }}
    >
      {isSi ? (
        <svg role="img" viewBox="0 0 24 24" width={iconSize} height={iconSize} fill="white">
          <path d={resolved.icon.path} />
        </svg>
      ) : (
        <resolved.icon size={iconSize} color="white" stroke={1.5} />
      )}
    </div>
  );
}

const MAX_VISIBLE = 4;

export default function PackIcons({ name, tags, size = 28 }) {
  const icons = resolvePackIcons(name, tags);
  const overlap = Math.round(size * 0.28);
  const borderOverlap = Math.round(size * 0.1);
  const visible = icons.slice(0, MAX_VISIBLE);
  const hidden = icons.slice(MAX_VISIBLE);

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {visible.map((resolved, i) => (
        <div key={i} style={{ marginLeft: i === 0 ? 0 : -overlap, zIndex: visible.length + 1 - i }}>
          <IconCircle resolved={resolved} circleSize={size} borderOverlap={borderOverlap} />
        </div>
      ))}
      {hidden.length > 0 && (
        <div
          title={hidden.map((r) => r.label).join(", ")}
          style={{
            marginLeft: -overlap,
            width: size,
            height: size,
            borderRadius: "50%",
            background: "#2a2c2f",
            border: "1.5px solid #5c5f66",
            boxShadow: `0 0 0 ${borderOverlap}px #1b1c1d`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            zIndex: 0,
          }}
        >
          <span style={{ fontSize: Math.round(size * 0.32), fontWeight: 700, color: "#909296", lineHeight: 1 }}>
            +{hidden.length}
          </span>
        </div>
      )}
    </div>
  );
}
