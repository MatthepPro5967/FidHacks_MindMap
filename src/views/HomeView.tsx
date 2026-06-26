import { useState } from "react";
import type { Skill, Connection } from "../types";
import { countDescendants } from "../utils/stats";
import { DEPTH_COLORS } from "../components/SkillNode";
import { AppHeader } from "../components/ui";
import { ThemeToggle } from "../components/ThemeToggle";
import { UserAvatar } from "../components/UserAvatar";
import { LeftPanel } from "../components/LeftPanel";
import { AIEntryWidget } from "../components/AIEntryWidget";
import { AICompanion } from "../components/AICompanion";

type Props = {
  skills: Skill[];
  connections: Connection[];
  isDark: boolean;
  onToggleTheme: () => void;
  onEnterTree: (rootId: string) => void;
  onEnterFull: () => void;
  onAddRoot: () => void;
  onAddSkill: (s: Skill) => void;
  onAddConnections: (c: Connection[]) => void;
  onDeleteSkill: (id: string) => void;
};

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
      <path d="M2 4 L10 4 L9 11 L3 11 Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="none" />
      <path d="M1 4 L11 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M4.5 4 L4.5 2.5 L7.5 2.5 L7.5 4" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function HomeView({ skills, connections, isDark, onToggleTheme, onEnterTree, onEnterFull, onAddRoot, onAddSkill, onAddConnections, onDeleteSkill }: Props) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const roots = skills.filter((s) => s.parent === null);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg-base)", fontFamily: "system-ui, sans-serif", overflow: "hidden" }}>
      <AppHeader
        left={
          <div>
            <span style={{ color: "var(--text-1)", fontWeight: 700, fontSize: 17, letterSpacing: "0.07em", textTransform: "uppercase" }}>MindMap</span>
            <div style={{ color: "var(--text-3)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 2 }}>Connecting the unconnected</div>
          </div>
        }
        right={
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
            <div style={{ width: 1, height: 28, background: "var(--border)" }} />
            <UserAvatar name="Matthew's Map" />
          </div>
        }
      />

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <LeftPanel skills={skills} />

        {/* Centre: skill cards */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 80px", minWidth: 0 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <button
              onClick={onEnterFull}
              style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: 5, color: "var(--text-2)", fontSize: 12, padding: "7px 14px", cursor: "pointer", fontFamily: "inherit" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--green)"; e.currentTarget.style.color = "var(--green-hi)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = ""; }}
            >
              Full Tree
            </button>
            <button
              onClick={onAddRoot}
              style={{ background: "var(--green)", border: "none", borderRadius: 5, color: "#fff", fontSize: 12, fontWeight: 600, padding: "7px 16px", cursor: "pointer", fontFamily: "inherit", textTransform: "uppercase", letterSpacing: "0.05em" }}
            >
              + New Skill
            </button>
          </div>

          {/* AI Entry Widget */}
          <div style={{ marginBottom: 18, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ color: "var(--text-3)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>AI Skill Entry</div>
            <AIEntryWidget skills={skills} onAdd={onAddSkill} onConnections={onAddConnections} />
          </div>

          {roots.length === 0 && (
            <div style={{ textAlign: "center", color: "var(--text-3)", marginTop: 80, fontSize: 14 }}>No skills yet — add your first one.</div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            {roots.map((root, i) => {
              const count = countDescendants(skills, root.id);
              const color = DEPTH_COLORS[1 + (i % (DEPTH_COLORS.length - 1))];
              const children = skills.filter((s) => s.parent === root.id).slice(0, 3);
              const isHovered = hoveredCard === root.id;
              return (
                <div
                  key={root.id}
                  onClick={() => onEnterTree(root.id)}
                  onMouseEnter={() => setHoveredCard(root.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{ position: "relative", background: isHovered ? "var(--bg-card-hover)" : "var(--bg-card)", border: "1px solid var(--border)", borderLeft: `3px solid ${color.border}`, borderRadius: 8, padding: "18px", cursor: "pointer" }}
                >
                  <div style={{ fontWeight: 700, color: "var(--text-1)", fontSize: 15, marginBottom: 4, paddingRight: 28 }}>{root.title}</div>
                  <div style={{ color: "var(--text-3)", fontSize: 11, marginBottom: children.length ? 12 : 0 }}>
                    {count === 0 ? "No sub-skills yet" : `${count} sub-skill${count !== 1 ? "s" : ""}`}
                  </div>
                  {children.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {children.map((c) => (
                        <span key={c.id} style={{ background: "var(--bg-input)", color: "var(--text-2)", fontSize: 10, borderRadius: 4, padding: "2px 7px" }}>{c.title}</span>
                      ))}
                      {count > 3 && <span style={{ color: "var(--text-3)", fontSize: 10 }}>+{count - 3} more</span>}
                    </div>
                  )}
                  {isHovered && (
                    <button
                      title={`Delete ${root.title}${count > 0 ? ` and ${count} sub-skill${count !== 1 ? "s" : ""}` : ""}`}
                      onClick={(e) => { e.stopPropagation(); onDeleteSkill(root.id); }}
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        width: 26,
                        height: 26,
                        borderRadius: 5,
                        border: "1px solid var(--border-md)",
                        background: "var(--bg-panel)",
                        color: "var(--text-3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        padding: 0,
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#ef4444"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#ef4444"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-3)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-md)"; }}
                    >
                      <TrashIcon />
                    </button>
                  )}
                </div>
              );
            })}
            <div
              onClick={onAddRoot}
              style={{ background: "transparent", border: "1px dashed var(--border-md)", borderRadius: 8, padding: "18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-3)", fontSize: 13, minHeight: 90 }}
              onMouseEnter={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = "var(--green)"; el.style.color = "var(--green-hi)"; }}
              onMouseLeave={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = "var(--border-md)"; el.style.color = "var(--text-3)"; }}
            >
              + New Skill
            </div>
          </div>
        </div>

        {/* Right: AI Growth Companion chat */}
        <div style={{
          width: 300,
          flexShrink: 0,
          borderLeft: "1px solid var(--border)",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}>
          <AICompanion skills={skills} connections={connections} />
        </div>
      </div>
    </div>
  );
}
