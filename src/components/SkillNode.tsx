import { useState, useRef, useCallback } from "react";
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

type NodeData = {
  label: string;
  depth: number;
  hasImage: boolean;
  id: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
};

function PencilIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
      <path d="M8.5 1.5 L10.5 3.5 L4 10 L1.5 10.5 L2 8 Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="none" />
      <path d="M7.5 2.5 L9.5 4.5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
      <path d="M2 4 L10 4 L9 11 L3 11 Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="none" />
      <path d="M1 4 L11 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M4.5 4 L4.5 2.5 L7.5 2.5 L7.5 4" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export default function SkillNode({ data }: { data: NodeData }) {
  const [hover, setHover] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const s = DEPTH_COLORS[Math.min(data.depth, DEPTH_COLORS.length - 1)];
  const size = NODE_SIZES[Math.min(data.depth, NODE_SIZES.length - 1)];

  const showHover = useCallback(() => {
    if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null; }
    setHover(true);
  }, []);

  const scheduleHide = useCallback(() => {
    hideTimer.current = setTimeout(() => setHover(false), 300);
  }, []);

  return (
    <>
      <Handle type="target" position={Position.Top} style={CENTER} />
      <div
        style={{ position: "relative", width: size, height: size }}
        onMouseEnter={showHover}
        onMouseLeave={scheduleHide}
      >
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
            filter: hover ? "brightness(1.2)" : "",
            transition: "filter 0.1s",
          }}
        >
          {data.label}
        </div>

        {hover && (data.onEdit || data.onDelete) && (
          <div
            className="nodrag"
            style={{
              position: "absolute",
              top: "50%",
              left: "calc(100% + 6px)",
              transform: "translateY(-50%)",
              display: "flex",
              flexDirection: "column",
              gap: 4,
              zIndex: 10,
            }}
            onMouseEnter={showHover}
            onMouseLeave={scheduleHide}
          >
            {data.onEdit && (
              <button
                className="nodrag"
                title="Edit skill"
                onClick={(e) => { e.stopPropagation(); data.onEdit!(data.id); }}
                onMouseDown={(e) => e.stopPropagation()}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 6,
                  border: "1px solid var(--border-md)",
                  background: "var(--bg-panel)",
                  color: "var(--text-2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  padding: 0,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--green-hi)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--green)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-2)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-md)"; }}
              >
                <PencilIcon />
              </button>
            )}
            {data.onDelete && (
              <button
                className="nodrag"
                title="Delete skill"
                onClick={(e) => { e.stopPropagation(); data.onDelete!(data.id); }}
                onMouseDown={(e) => e.stopPropagation()}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 6,
                  border: "1px solid var(--border-md)",
                  background: "var(--bg-panel)",
                  color: "var(--text-2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  padding: 0,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#ef4444"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#ef4444"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-2)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-md)"; }}
              >
                <TrashIcon />
              </button>
            )}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} style={CENTER} />
    </>
  );
}
