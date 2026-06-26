import { useState, useCallback } from "react";
import type { Skill, Connection } from "./types";
import { skills as initialSkills, connections as initialConnections } from "./data";
import { getDepth, getSubtreeIds, countDescendants } from "./utils/stats";
import { useTheme } from "./components/ThemeToggle";
import { AddSkillModal } from "./components/AddSkillModal";
import { EditSkillModal } from "./components/EditSkillModal";
import { DetailModal } from "./components/DetailModal";
import { ConnectionModal } from "./components/ConnectionModal";
import { HomeView } from "./views/HomeView";
import { TreeView, FullTreeView } from "./views/TreeView";

type View = { kind: "home" } | { kind: "tree"; rootId: string } | { kind: "full" };

function ConfirmDeleteModal({
  skill,
  descendantCount,
  onConfirm,
  onCancel,
}: {
  skill: Skill;
  descendantCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      onClick={onCancel}
      style={{ position: "fixed", inset: 0, zIndex: 50, background: "var(--modal-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 10, padding: "24px 26px", width: 340, maxWidth: "90vw", fontFamily: "system-ui, sans-serif" }}
      >
        <div style={{ color: "var(--text-1)", fontWeight: 700, fontSize: 16, marginBottom: 10 }}>Delete "{skill.title}"?</div>
        {descendantCount > 0 && (
          <div style={{ color: "var(--text-2)", fontSize: 13, marginBottom: 18, lineHeight: 1.5 }}>
            This will also delete <strong style={{ color: "var(--text-1)" }}>{descendantCount} sub-skill{descendantCount !== 1 ? "s" : ""}</strong> underneath it.
          </div>
        )}
        <div style={{ display: "flex", gap: 8, marginTop: descendantCount === 0 ? 18 : 0 }}>
          <button
            onClick={onConfirm}
            style={{ background: "#ef4444", border: "none", borderRadius: 6, color: "#fff", fontSize: 13, fontWeight: 600, padding: "9px 18px", cursor: "pointer", fontFamily: "inherit" }}
          >
            Delete
          </button>
          <button
            onClick={onCancel}
            style={{ background: "transparent", border: "1px solid var(--border-md)", borderRadius: 6, color: "var(--text-2)", fontSize: 13, padding: "9px 18px", cursor: "pointer", fontFamily: "inherit" }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { isDark, toggle } = useTheme();
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [connections, setConnections] = useState<Connection[]>(initialConnections);
  const [view, setView] = useState<View>({ kind: "home" });
  const [showAdd, setShowAdd] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [selectedConnId, setSelectedConnId] = useState<string | null>(null);

  const selectedSkill = selectedId ? skills.find((s) => s.id === selectedId) ?? null : null;
  const editSkill = editId ? skills.find((s) => s.id === editId) ?? null : null;
  const confirmDeleteSkill = confirmDeleteId ? skills.find((s) => s.id === confirmDeleteId) ?? null : null;
  const selectedConn = selectedConnId ? connections.find((c) => c.id === selectedConnId) ?? null : null;

  const addParentId = view.kind === "tree" ? view.rootId : null;
  const addParentSkills = view.kind === "tree"
    ? skills.filter((s) => getSubtreeIds(skills, view.rootId).has(s.id))
    : skills;

  const handleDeleteRequest = useCallback((id: string) => {
    setConfirmDeleteId(id);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (!confirmDeleteId) return;
    const ids = getSubtreeIds(skills, confirmDeleteId);
    setSkills((prev) => prev.filter((s) => !ids.has(s.id)));
    // Drop any cross-domain connections touching a deleted node
    setConnections((prev) => prev.filter((c) => !ids.has(c.source) && !ids.has(c.target)));
    // If we deleted the current tree's root, go home
    if (view.kind === "tree" && view.rootId === confirmDeleteId) {
      setView({ kind: "home" });
    }
    setConfirmDeleteId(null);
    setSelectedId(null);
    setEditId(null);
  }, [confirmDeleteId, skills, view]);

  // Merge newly-discovered cross-domain connections, de-duplicating by id.
  const handleAddConnections = useCallback((found: Connection[]) => {
    if (!found.length) return;
    setConnections((prev) => {
      const byId = new Map(prev.map((c) => [c.id, c]));
      for (const c of found) byId.set(c.id, c);
      return [...byId.values()];
    });
  }, []);

  const handleUpdate = useCallback((updated: Skill) => {
    setSkills((prev) => prev.map((s) => s.id === updated.id ? updated : s));
    setEditId(null);
  }, []);

  const shared = { isDark, onToggleTheme: toggle };

  return (
    <>
      {view.kind === "home" && (
        <HomeView
          {...shared}
          skills={skills}
          connections={connections}
          onEnterTree={(id) => setView({ kind: "tree", rootId: id })}
          onEnterFull={() => setView({ kind: "full" })}
          onAddRoot={() => setShowAdd(true)}
          onAddSkill={(s) => setSkills((prev) => [...prev, s])}
          onAddConnections={handleAddConnections}
          onDeleteSkill={handleDeleteRequest}
        />
      )}
      {view.kind === "tree" && (
        <TreeView
          {...shared}
          skills={skills}
          rootId={view.rootId}
          onBack={() => setView({ kind: "home" })}
          onAddSkill={() => setShowAdd(true)}
          onAddSkillDirect={(s) => setSkills((prev) => [...prev, { ...s, createdAt: new Date().toISOString() }])}
          onAddConnections={handleAddConnections}
          onNodeClick={setSelectedId}
          onDeleteSkill={handleDeleteRequest}
          onEditSkill={setEditId}
        />
      )}
      {view.kind === "full" && (
        <FullTreeView {...shared} skills={skills}
          connections={connections}
          onConnectionClick={setSelectedConnId}
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
      {editSkill && (
        <EditSkillModal
          skill={editSkill}
          onSave={handleUpdate}
          onClose={() => setEditId(null)}
        />
      )}
      {selectedSkill && !editId && !confirmDeleteId && (
        <DetailModal
          skill={selectedSkill}
          depth={getDepth(skills, selectedSkill.id)}
          onClose={() => setSelectedId(null)}
        />
      )}
      {selectedConn && (
        <ConnectionModal
          connection={selectedConn}
          skills={skills}
          onClose={() => setSelectedConnId(null)}
        />
      )}
      {confirmDeleteSkill && (
        <ConfirmDeleteModal
          skill={confirmDeleteSkill}
          descendantCount={countDescendants(skills, confirmDeleteSkill.id)}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </>
  );
}
