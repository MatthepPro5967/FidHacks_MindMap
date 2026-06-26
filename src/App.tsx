import { useState } from "react";
import type { Skill } from "./types";
import { skills as initialSkills } from "./data";
import { getDepth, getSubtreeIds } from "./utils/stats";
import { useTheme } from "./components/ThemeToggle";
import { AddSkillModal } from "./components/AddSkillModal";
import { DetailModal } from "./components/DetailModal";
import { HomeView } from "./views/HomeView";
import { TreeView, FullTreeView } from "./views/TreeView";

type View = { kind: "home" } | { kind: "tree"; rootId: string } | { kind: "full" };

export default function App() {
  const { isDark, toggle } = useTheme();
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [view, setView] = useState<View>({ kind: "home" });
  const [showAdd, setShowAdd] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedSkill = selectedId ? skills.find((s) => s.id === selectedId) ?? null : null;
  const addParentId = view.kind === "tree" ? view.rootId : null;
  const addParentSkills = view.kind === "tree"
    ? skills.filter((s) => getSubtreeIds(skills, view.rootId).has(s.id))
    : skills;

  const shared = { isDark, onToggleTheme: toggle };

  return (
    <>
      {view.kind === "home" && (
        <HomeView {...shared} skills={skills}
          onEnterTree={(id) => setView({ kind: "tree", rootId: id })}
          onEnterFull={() => setView({ kind: "full" })}
          onAddRoot={() => setShowAdd(true)}
          onAddSkill={(s) => setSkills((prev) => [...prev, s])}
        />
      )}
      {view.kind === "tree" && (
        <TreeView {...shared} skills={skills} rootId={view.rootId}
          onBack={() => setView({ kind: "home" })}
          onAddSkill={() => setShowAdd(true)}
          onNodeClick={setSelectedId}
        />
      )}
      {view.kind === "full" && (
        <FullTreeView {...shared} skills={skills}
          onBack={() => setView({ kind: "home" })}
          onNodeClick={setSelectedId}
        />
      )}

      {showAdd && (
        <AddSkillModal
          skills={addParentSkills}
          parentId={addParentId}
          onAdd={(s) => setSkills((prev) => [...prev, { ...s, createdAt: new Date().toISOString() }])}
          onClose={() => { setShowAdd(false); sessionStorage.removeItem("prefillTitle"); }}
        />
      )}
      {selectedSkill && (
        <DetailModal
          skill={selectedSkill}
          depth={getDepth(skills, selectedSkill.id)}
          onClose={() => setSelectedId(null)}
        />
      )}
    </>
  );
}
