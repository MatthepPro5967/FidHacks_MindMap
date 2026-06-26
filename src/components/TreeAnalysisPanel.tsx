import { useState, useEffect, useRef } from "react";
import type { Skill, Connection } from "../types";
import { analyzeTree, type TreeAnalysis } from "../utils/ai";
import { getSubtreeIds } from "../utils/stats";

type Props = {
  // allSkills: every skill in the map (used for connection endpoint lookups)
  skills: Skill[];
  connections: Connection[];
  treeName: string;
  // When set, analysis is scoped to this tree's subtree.
  // When absent (Full Tree), all skills are treated as the tree.
  rootId?: string;
};

export function TreeAnalysisPanel({ skills, connections, treeName, rootId }: Props) {
  const treeSkills = rootId
    ? skills.filter((s) => getSubtreeIds(skills, rootId).has(s.id))
    : skills;
  const [open, setOpen] = useState(true);
  const [analysis, setAnalysis] = useState<TreeAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  return (
    <div style={{
      position: "absolute",
      top: 16,
      right: 16,
      zIndex: 20,
      fontFamily: "system-ui, sans-serif",
    }}>
      {/* Toggle button when closed */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            color: "var(--text-2)",
            fontSize: 12,
            fontWeight: 600,
            padding: "8px 14px",
            cursor: "pointer",
            fontFamily: "inherit",
            boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
          }}
        >
          ✦ Analysis
        </button>
      )}

      {/* Panel */}
      {open && (
        <div style={{
          width: 290,
          background: "var(--bg-panel)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 14px 10px",
            borderBottom: "1px solid var(--border)",
          }}>
            <div>
              <div style={{ color: "var(--text-1)", fontSize: 13, fontWeight: 700 }}>✦ Skill Analysis</div>
              <div style={{ color: "var(--text-3)", fontSize: 10, marginTop: 1 }}>{treeName}</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {!loading && (
                <button
                  onClick={refresh}
                  title="Refresh analysis"
                  style={{ background: "transparent", border: "none", color: "var(--text-3)", fontSize: 14, cursor: "pointer", padding: "2px 4px", lineHeight: 1 }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-1)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-3)")}
                >↻</button>
              )}
              <button
                onClick={() => setOpen(false)}
                title="Close"
                style={{ background: "transparent", border: "none", color: "var(--text-3)", fontSize: 16, cursor: "pointer", padding: "2px 4px", lineHeight: 1 }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-1)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-3)")}
              >×</button>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: "12px 14px 14px", maxHeight: 420, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>

            {loading && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[80, 100, 60].map((w, i) => (
                  <div key={i} style={{ height: 10, width: `${w}%`, background: "var(--border)", borderRadius: 4, animation: "pulse 1.4s ease-in-out infinite", animationDelay: `${i * 0.2}s` }} />
                ))}
                <div style={{ color: "var(--text-3)", fontSize: 11, marginTop: 4 }}>Analyzing your skills…</div>
              </div>
            )}

            {error && (
              <div style={{ color: "#ef4444", fontSize: 12 }}>{error}</div>
            )}

            {analysis && (
              <>
                {/* Summary */}
                <div>
                  <div style={{ color: "var(--text-3)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Overview</div>
                  <p style={{ color: "var(--text-1)", fontSize: 12, lineHeight: 1.65, margin: 0 }}>{analysis.summary}</p>
                </div>

                {/* Strengths */}
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

                {/* Gaps */}
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
        </div>
      )}
    </div>
  );
}
