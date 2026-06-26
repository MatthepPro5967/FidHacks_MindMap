import type { Skill } from "../types";
import SkillTree from "../components/SkillTree";
import { AppHeader } from "../components/ui";
import { ThemeToggle } from "../components/ThemeToggle";
import { VIRTUAL_ROOT } from "../constants";

type BaseProps = {
  skills: Skill[];
  isDark: boolean;
  onToggleTheme: () => void;
  onBack: () => void;
  onNodeClick: (id: string) => void;
};

export function TreeView({ skills, rootId, isDark, onToggleTheme, onBack, onAddSkill, onNodeClick }: BaseProps & { rootId: string; onAddSkill: () => void }) {
  const root = skills.find((s) => s.id === rootId);
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
            <button onClick={onAddSkill} style={{ background: "var(--green)", border: "none", borderRadius: 5, color: "#fff", fontSize: 12, fontWeight: 600, padding: "8px 16px", cursor: "pointer", fontFamily: "inherit", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              + Add
            </button>
          </div>
        }
      />
      <div style={{ flex: 1 }}>
        <SkillTree skills={skills} rootId={rootId} isDark={isDark} onNodeClick={onNodeClick} />
      </div>
    </div>
  );
}

export function FullTreeView({ skills, isDark, onToggleTheme, onBack, onNodeClick }: BaseProps) {
  const patched: Skill[] = [
    { id: VIRTUAL_ROOT, parent: null, title: "All Skills" },
    ...skills.map((s) => s.parent === null ? { ...s, parent: VIRTUAL_ROOT } : s),
  ];
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
        right={<ThemeToggle isDark={isDark} onToggle={onToggleTheme} />}
      />
      <div style={{ flex: 1 }}>
        <SkillTree skills={patched} rootId={VIRTUAL_ROOT} isDark={isDark} onNodeClick={(id) => { if (id !== VIRTUAL_ROOT) onNodeClick(id); }} />
      </div>
    </div>
  );
}
