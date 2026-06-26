import { Handle, Position } from "reactflow";

// Fidelity palette: green, grey, black, white
export const DEPTH_COLORS = [
  { bg: "#0a0a0a", border: "#00754A", text: "#fff" },   // 0 root — black w/ green ring
  { bg: "#00754A", border: "#00A650", text: "#fff" },   // 1 — Fidelity dark green
  { bg: "#374151", border: "#4B5563", text: "#fff" },   // 2 — slate grey
  { bg: "#059669", border: "#10b981", text: "#fff" },   // 3 — emerald green
  { bg: "#1f2937", border: "#374151", text: "#d1d5db" },// 4 — dark grey
  { bg: "#065f46", border: "#059669", text: "#fff" },   // 5 — deep green
  { bg: "#111827", border: "#374151", text: "#9ca3af" },// 6 — darkest grey
];

const NODE_SIZES = [96, 78, 72, 68, 64];

const CENTER: React.CSSProperties = {
  left: "50%",
  top: "50%",
  transform: "translate(-50%, -50%)",
  width: 1,
  height: 1,
  minWidth: 1,
  minHeight: 1,
  background: "transparent",
  border: "none",
  opacity: 0,
  pointerEvents: "none",
};

export default function SkillNode({ data }: { data: { label: string; depth: number; hasImage: boolean } }) {
  const s = DEPTH_COLORS[Math.min(data.depth, DEPTH_COLORS.length - 1)];
  const size = NODE_SIZES[Math.min(data.depth, NODE_SIZES.length - 1)];

  return (
    <>
      <Handle type="target" position={Position.Top} style={CENTER} />
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: s.bg,
          border: `2px solid ${s.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: s.text,
          fontSize: data.depth === 0 ? 11 : 10,
          fontWeight: 600,
          textAlign: "center",
          padding: "10px",
          lineHeight: 1.25,
          userSelect: "none",
          fontFamily: "system-ui, sans-serif",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.filter = "brightness(1.2)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.filter = "";
        }}
      >
        {data.label}
      </div>
      <Handle type="source" position={Position.Bottom} style={CENTER} />
    </>
  );
}
