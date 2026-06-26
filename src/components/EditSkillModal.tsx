import { useState, useRef } from "react";
import type { Skill } from "../types";
import { todayStr } from "../utils/stats";
import { Modal, Input, FieldLabel, PrimaryBtn, SecondaryBtn } from "./ui";

type Props = {
  skill: Skill;
  onSave: (updated: Skill) => void;
  onClose: () => void;
};

export function EditSkillModal({ skill, onSave, onClose }: Props) {
  const [title, setTitle] = useState(skill.title);
  const [description, setDescription] = useState(skill.description ?? "");
  const [date, setDate] = useState(skill.date ?? "");
  const [image, setImage] = useState<string | undefined>(skill.image);
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
    onSave({ ...skill, title: trimmed, description: description || undefined, date: date || undefined, image });
    onClose();
  }

  return (
    <Modal title="Edit Skill" onClose={onClose}>
      <FieldLabel>Name</FieldLabel>
      <Input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} />
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
        {image && (
          <>
            <img src={image} alt="preview" style={{ width: 36, height: 36, borderRadius: 5, objectFit: "cover" }} />
            <SecondaryBtn onClick={() => setImage(undefined)}>Remove</SecondaryBtn>
          </>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImage} />
      <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
        <PrimaryBtn onClick={submit}>Save</PrimaryBtn>
        <SecondaryBtn onClick={onClose}>Cancel</SecondaryBtn>
      </div>
    </Modal>
  );
}
