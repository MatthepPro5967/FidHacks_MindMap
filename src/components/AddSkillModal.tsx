import { useState, useRef } from "react";
import type { Skill } from "../types";
import { makeId, todayStr } from "../utils/stats";
import { Modal, Input, Select, FieldLabel, PrimaryBtn, SecondaryBtn } from "./ui";

type Props = {
  skills: Skill[];
  parentId: string | null;
  onAdd: (s: Skill) => void;
  onClose: () => void;
};

export function AddSkillModal({ skills, parentId, onAdd, onClose }: Props) {
  const [title, setTitle] = useState(sessionStorage.getItem("prefillTitle") ?? "");
  const [selectedParent, setSelectedParent] = useState(parentId ?? "none");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(todayStr());
  const [image, setImage] = useState<string | undefined>();
  const fileRef = useRef<HTMLInputElement>(null);

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  function submit() {
    const trimmed = title.trim();
    if (!trimmed) return;
    const parent = selectedParent === "none" ? null : selectedParent;
    onAdd({ id: makeId(trimmed), parent, title: trimmed, description: description || undefined, date: date || undefined, image });
    onClose();
  }

  return (
    <Modal title={parentId === null ? "New Skill" : "Add to Tree"} onClose={onClose}>
      <FieldLabel>Name</FieldLabel>
      <Input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="e.g. TypeScript" />
      <FieldLabel>Connect to</FieldLabel>
      <Select value={selectedParent} onChange={(e) => setSelectedParent(e.target.value)}>
        {parentId === null && <option value="none">None (root skill)</option>}
        {skills.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
      </Select>
      <FieldLabel>Description</FieldLabel>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Optional…"
        style={{ background: "var(--bg-input)", border: "1px solid var(--border-md)", borderRadius: 6, color: "var(--text-1)", fontSize: 13, padding: "8px 12px", outline: "none", width: "100%", fontFamily: "system-ui, sans-serif", resize: "vertical", minHeight: 68 }}
      />
      <FieldLabel>Date</FieldLabel>
      <Input type="date" value={date} max={todayStr()} onChange={(e) => setDate(e.target.value)} />
      <FieldLabel>Image</FieldLabel>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <SecondaryBtn onClick={() => fileRef.current?.click()}>{image ? "Change" : "Upload"}</SecondaryBtn>
        {image && <img src={image} alt="preview" style={{ width: 36, height: 36, borderRadius: 5, objectFit: "cover" }} />}
      </div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImage} />
      <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
        <PrimaryBtn onClick={submit}>Add</PrimaryBtn>
        <SecondaryBtn onClick={onClose}>Cancel</SecondaryBtn>
      </div>
    </Modal>
  );
}
