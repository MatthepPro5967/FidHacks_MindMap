import { useState } from "react";
import type { Skill, Connection } from "../types";
import { connectionStyle, strengthLabel } from "../utils/connectionStyle";

type Props = {
  skills: Skill[];
  connections: Connection[];
  onHover: (id: string | null) => void;
  onClick: (id: string) => void;
};

export function ConnectionsPanel({ skills, connections, onHover, onClick }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const titleById = new Map(skills.map((s) => [s.id, s.title]));

  function handleEnter(id: string) {
    setHoveredId(id);
    onHover(id);
  }

  function handleLeave() {
    setHoveredId(null);
    onHover(null);
  }

  const sorted = [...connections].sort((a, b) => b.strength - a.strength);

  return (
    <div style={{
      width: "100%",
      background: "var(--bg-panel)",
      border: "1px solid var(--border)",
      borderRadius: 10,
      boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      fontFamily: "system-ui, sans-serif",
      maxHeight: 280,
    }}>
      {/* Header */}
      <div style={{ padding: "11px 14px 9px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <div style={{ color: "var(--text-1)", fontSize: 13, fontWeight: 700 }}>Connections</div>
        <div style={{ color: "var(--text-3)", fontSize: 10, marginTop: 2 }}>
          {connections.length} cross-domain link{connections.length !== 1 ? "s" : ""} · hover to preview
        </div>
      </div>

      {/* Scrollable list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 10px" }}>
        {connections.length === 0 && (
          <div style={{ color: "var(--text-3)", fontSize: 12, textAlign: "center", marginTop: 40, lineHeight: 1.6 }}>
            No connections yet.<br />Add skills to discover hidden links.
          </div>
        )}
        {sorted.map((c) => {
          const { color } = connectionStyle(c.strength);
          const isHovered = hoveredId === c.id;
          const a = titleById.get(c.source) ?? c.source;
          const b = titleById.get(c.target) ?? c.target;

          return (
            <div
              key={c.id}
              onMouseEnter={() => handleEnter(c.id)}
              onMouseLeave={handleLeave}
              onClick={() => onClick(c.id)}
              style={{
                background: isHovered ? "var(--bg-card-hover)" : "var(--bg-card)",
                border: `1px solid ${isHovered ? color : "var(--border)"}`,
                borderLeft: `3px solid ${color}`,
                borderRadius: 8,
                padding: "10px 12px",
                marginBottom: 8,
                cursor: "pointer",
                transition: "border-color 0.15s, background 0.15s",
              }}
            >
              {/* Skill names */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                <span style={{ color: "var(--text-1)", fontSize: 11, fontWeight: 600, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a}</span>
                <span style={{ color, fontSize: 10, flexShrink: 0 }}>↔</span>
                <span style={{ color: "var(--text-1)", fontSize: 11, fontWeight: 600, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "right" }}>{b}</span>
              </div>

              {/* Strength bar + label */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <div style={{ flex: 1, height: 3, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${c.strength}%`, background: color, borderRadius: 2 }} />
                </div>
                <span style={{ color, fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                  {strengthLabel(c.strength)}
                </span>
              </div>

              {/* Summary */}
              <div style={{
                color: "var(--text-2)",
                fontSize: 10,
                lineHeight: 1.55,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}>
                {c.summary}
              </div>

              {isHovered && (
                <div style={{ color: "var(--text-3)", fontSize: 9, marginTop: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Click for details
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
