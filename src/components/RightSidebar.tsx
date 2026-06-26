import { useState, useEffect, useRef } from "react";
import type { Skill, Connection } from "../types";
import { analyzeTree, type TreeAnalysis } from "../utils/ai";
import { getSubtreeIds } from "../utils/stats";
import { connectionStyle, strengthLabel } from "../utils/connectionStyle";

type Props = {
  skills: Skill[];
  connections: Connection[];
  treeName: string;
  rootId?: string;
  onConnectionHover: (id: string | null) => void;
  onConnectionClick: (id: string) => void;
};

export function RightSidebar({ skills, connections, treeName, rootId, onConnectionHover, onConnectionClick }: Props) {
  const treeSkills = rootId
    ? skills.filter((s) => getSubtreeIds(skills, rootId).has(s.id))
    : skills;

  const [analysis, setAnalysis] = useState<TreeAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredConnId, setHoveredConnId] = useState<string | null>(null);
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;
    run();
  }, []);

  async function run() {
    setLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const result = await analyzeTree(treeSkills, skills, connections, treeName);
      setAnalysis(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  function refresh() {
    ranRef.current = false;
    run();
    ranRef.current = true;
  }

  function handleConnEnter(id: string) {
    setHoveredConnId(id);
    onConnectionHover(id);
  }

  function handleConnLeave() {
    setHoveredConnId(null);
    onConnectionHover(null);
  }

  const titleById = new Map(skills.map((s) => [s.id, s.title]));
  const sortedConns = [...connections].sort((a, b) => b.strength - a.strength);

  return (
    <div style={{
      width: 280,
      flexShrink: 0,
      borderLeft: "1px solid var(--border)",
      background: "var(--bg-panel)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      fontFamily: "system-ui, sans-serif",
    }}>

      {/* ── Analysis section ─────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 10px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <div>
          <div style={{ color: "var(--text-1)", fontSize: 13, fontWeight: 700 }}>✦ Skill Analysis</div>
          <div style={{ color: "var(--text-3)", fontSize: 10, marginTop: 1 }}>{treeName}</div>
        </div>
        {!loading && (
          <button
            onClick={refresh}
            title="Refresh"
            style={{ background: "transparent", border: "none", color: "var(--text-3)", fontSize: 15, cursor: "pointer", padding: "2px 6px", lineHeight: 1 }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-1)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-3)")}
          >↻</button>
        )}
      </div>

      <div style={{ overflowY: "auto", padding: "12px 16px 14px", display: "flex", flexDirection: "column", gap: 14, flex: "0 0 auto", maxHeight: "50%" }}>
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[80, 100, 60].map((w, i) => (
              <div key={i} style={{ height: 9, width: `${w}%`, background: "var(--border)", borderRadius: 4, animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite` }} />
            ))}
            <div style={{ color: "var(--text-3)", fontSize: 11, marginTop: 2 }}>Analyzing your skills…</div>
          </div>
        )}

        {error && <div style={{ color: "#ef4444", fontSize: 12 }}>{error}</div>}

        {analysis && (
          <>
            <div>
              <div style={{ color: "var(--text-3)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Overview</div>
              <p style={{ color: "var(--text-1)", fontSize: 12, lineHeight: 1.65, margin: 0 }}>{analysis.summary}</p>
            </div>

            {analysis.strengths.length > 0 && (
              <div>
                <div style={{ color: "var(--text-3)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 7 }}>Strengths</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {analysis.strengths.map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--green)", flexShrink: 0, marginTop: 5 }} />
                      <span style={{ color: "var(--text-1)", fontSize: 12, lineHeight: 1.55 }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysis.gaps.length > 0 && (
              <div>
                <div style={{ color: "var(--text-3)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 7 }}>Room for improvement</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {analysis.gaps.map((g, i) => (
                    <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 7, padding: "9px 11px" }}>
                      <div style={{ color: "var(--text-1)", fontSize: 11, fontWeight: 600, marginBottom: 3 }}>{g.area}</div>
                      <div style={{ color: "var(--text-2)", fontSize: 11, lineHeight: 1.55 }}>{g.action}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Divider ──────────────────────────────────────────── */}
      <div style={{ height: 1, background: "var(--border)", flexShrink: 0 }} />

      {/* ── Connections section ───────────────────────────────── */}
      <div style={{ padding: "12px 16px 8px", flexShrink: 0, borderBottom: "1px solid var(--border)" }}>
        <div style={{ color: "var(--text-1)", fontSize: 13, fontWeight: 700 }}>Connections</div>
        <div style={{ color: "var(--text-3)", fontSize: 10, marginTop: 2 }}>
          {connections.length} cross-domain link{connections.length !== 1 ? "s" : ""} · hover to preview
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 10px" }}>
        {connections.length === 0 && (
          <div style={{ color: "var(--text-3)", fontSize: 12, textAlign: "center", marginTop: 32, lineHeight: 1.6 }}>
            No connections yet.<br />Add skills to discover hidden links.
          </div>
        )}
        {sortedConns.map((c) => {
          const { color } = connectionStyle(c.strength);
          const isHovered = hoveredConnId === c.id;
          const a = titleById.get(c.source) ?? c.source;
          const b = titleById.get(c.target) ?? c.target;
          return (
            <div
              key={c.id}
              onMouseEnter={() => handleConnEnter(c.id)}
              onMouseLeave={handleConnLeave}
              onClick={() => onConnectionClick(c.id)}
              style={{
                background: isHovered ? "var(--bg-card-hover)" : "var(--bg-card)",
                border: `1px solid ${isHovered ? color : "var(--border)"}`,
                borderLeft: `3px solid ${color}`,
                borderRadius: 8,
                padding: "9px 11px",
                marginBottom: 7,
                cursor: "pointer",
                transition: "border-color 0.12s, background 0.12s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
                <span style={{ color: "var(--text-1)", fontSize: 11, fontWeight: 600, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a}</span>
                <span style={{ color, fontSize: 10, flexShrink: 0 }}>↔</span>
                <span style={{ color: "var(--text-1)", fontSize: 11, fontWeight: 600, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "right" }}>{b}</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                <div style={{ flex: 1, height: 3, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${c.strength}%`, background: color, borderRadius: 2 }} />
                </div>
                <span style={{ color, fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                  {strengthLabel(c.strength)}
                </span>
              </div>

              <div style={{ color: "var(--text-2)", fontSize: 10, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {c.summary}
              </div>

              {isHovered && (
                <div style={{ color: "var(--text-3)", fontSize: 9, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>
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
