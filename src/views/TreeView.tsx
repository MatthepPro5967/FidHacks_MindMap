import { useState, useMemo } from "react";
import type { Skill, Connection } from "../types";
import SkillTree from "../components/SkillTree";
import { TreeAnalysisPanel } from "../components/TreeAnalysisPanel";
import { RightSidebar } from "../components/RightSidebar";
import { AIEntryWidget } from "../components/AIEntryWidget";
import { AppHeader } from "../components/ui";
import { ThemeToggle } from "../components/ThemeToggle";
import { VIRTUAL_ROOT } from "../constants";
import { getSubtreeIds } from "../utils/stats";

type BaseProps = {
  skills: Skill[];
  isDark: boolean;
  onToggleTheme: () => void;
  onBack: () => void;
  onNodeClick: (id: string) => void;
  connections?: Connection[];
  onConnectionClick?: (id: string) => void;
};

type TreeViewProps = BaseProps & {
  rootId: string;
  onAddSkill: () => void;
  onAddSkillDirect: (s: Skill) => void;
  onAddConnections: (c: Connection[]) => void;
  onDeleteSkill: (id: string) => void;
  onEditSkill: (id: string) => void;
};

export function TreeView({ skills, rootId, isDark, onToggleTheme, onBack, onAddSkill, onAddSkillDirect, onAddConnections, onNodeClick, onDeleteSkill, onEditSkill, connections, onConnectionClick }: TreeViewProps) {
  const root = skills.find((s) => s.id === rootId);
  // Only pass skills within this tree to the AI widget so it only places
  // new nodes inside the current tree, never in a sibling tree.
  const subtreeSkills = skills.filter((s) => getSubtreeIds(skills, rootId).has(s.id));

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg-base)", fontFamily: "system-ui, sans-serif", overflow: "hidden" }}>
      <AppHeader
        left={
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button onClick={onBack} style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: 5, color: "var(--text-2)", fontSize: 12, padding: "6px 12px", cursor: "pointer", fontFamily: "inherit" }}>← Back</button>
            <div>
              <div style={{ color: "var(--text-1)", fontWeight: 700, fontSize: 17 }}>{root?.title ?? "Skill Tree"}</div>
              <div style={{ color: "var(--text-3)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>Skill Tree</div>
            </div>
          </div>
        }
        right={
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
            <button
              onClick={() => onDeleteSkill(rootId)}
              style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: 5, color: "var(--text-3)", fontSize: 12, padding: "8px 14px", cursor: "pointer", fontFamily: "inherit" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#ef4444"; (e.currentTarget as HTMLButtonElement).style.color = "#ef4444"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-3)"; }}
              title="Delete entire tree"
            >
              Delete Tree
            </button>
            <button onClick={onAddSkill} style={{ background: "var(--green)", border: "none", borderRadius: 5, color: "#fff", fontSize: 12, fontWeight: 600, padding: "8px 16px", cursor: "pointer", fontFamily: "inherit", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              + Add
            </button>
          </div>
        }
      />

      <div style={{ flex: 1, position: "relative" }}>
        <SkillTree
          skills={skills}
          rootId={rootId}
          isDark={isDark}
          onNodeClick={onNodeClick}
          onEditNode={onEditSkill}
          onDeleteNode={onDeleteSkill}
          connections={connections}
          onConnectionClick={onConnectionClick}
        />
        <TreeAnalysisPanel
          skills={skills}
          connections={connections ?? []}
          treeName={root?.title ?? "Skill Tree"}
          rootId={rootId}
        />
        {/* AI entry — bottom right, below the analysis panel */}
        <div style={{
          position: "absolute",
          bottom: 16,
          right: 16,
          width: 290,
          background: "var(--bg-panel)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
          padding: "12px 14px",
          zIndex: 20,
        }}>
          <div style={{ color: "var(--text-3)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 9 }}>
            AI Add to {root?.title ?? "Tree"}
          </div>
          <AIEntryWidget
            skills={subtreeSkills}
            onAdd={onAddSkillDirect}
            onConnections={onAddConnections}
          />
        </div>
      </div>
    </div>
  );
}

export function FullTreeView({ skills, isDark, onToggleTheme, onBack, onNodeClick, connections = [], onConnectionClick }: BaseProps) {
  const [hoveredConnId, setHoveredConnId] = useState<string | null>(null);
  const [showAllConns, setShowAllConns] = useState(false);

  const patched = useMemo<Skill[]>(() => [
    { id: VIRTUAL_ROOT, parent: null, title: "All Skills" },
    ...skills.map((s) => s.parent === null ? { ...s, parent: VIRTUAL_ROOT } : s),
  ], [skills]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg-base)", fontFamily: "system-ui, sans-serif", overflow: "hidden" }}>
      <AppHeader
        left={
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button onClick={onBack} style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: 5, color: "var(--text-2)", fontSize: 12, padding: "6px 12px", cursor: "pointer", fontFamily: "inherit" }}>← Back</button>
            <div>
              <div style={{ color: "var(--text-1)", fontWeight: 700, fontSize: 17 }}>Full Tree</div>
              <div style={{ color: "var(--text-3)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>All skills combined</div>
            </div>
          </div>
        }
        right={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={() => setShowAllConns((v) => !v)}
              style={{
                background: showAllConns ? "var(--green)" : "transparent",
                border: `1px solid ${showAllConns ? "var(--green)" : "var(--border)"}`,
                borderRadius: 5,
                color: showAllConns ? "#fff" : "var(--text-2)",
                fontSize: 12,
                fontWeight: 600,
                padding: "6px 13px",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "background 0.15s, border-color 0.15s, color 0.15s",
              }}
            >
              {showAllConns ? "Hide Connections" : "Show Connections"}
            </button>
            <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
          </div>
        }
      />
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Canvas */}
        <div style={{ flex: 1, position: "relative" }}>
          <SkillTree
            skills={patched}
            rootId={VIRTUAL_ROOT}
            isDark={isDark}
            onNodeClick={(id) => { if (id !== VIRTUAL_ROOT) onNodeClick(id); }}
            connections={connections}
            hoveredConnectionId={hoveredConnId}
            showAllConnections={showAllConns}
            onConnectionClick={onConnectionClick}
          />
        </div>

        {/* Right sidebar — analysis + connections */}
        <RightSidebar
          skills={skills}
          connections={connections}
          treeName="Full Skill Map"
          onConnectionHover={setHoveredConnId}
          onConnectionClick={(id) => onConnectionClick?.(id)}
        />
      </div>
    </div>
  );
}
