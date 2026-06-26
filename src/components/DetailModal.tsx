import type { Skill } from "../types";
import { DEPTH_COLORS } from "./SkillNode";
import { Modal, PrimaryBtn } from "./ui";

type Props = { skill: Skill; depth: number; onClose: () => void };

export function DetailModal({ skill, depth, onClose }: Props) {
  const color = DEPTH_COLORS[Math.min(depth, DEPTH_COLORS.length - 1)];
  return (
    <Modal title={skill.title} onClose={onClose}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: -8, marginBottom: 12 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: color.bg, border: `1.5px solid ${color.border}` }} />
        {skill.date && (
          <span style={{ color: "var(--text-2)", fontSize: 12 }}>
            {new Date(skill.date + "T12:00:00").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </span>
        )}
      </div>
      {skill.image && <img src={skill.image} alt={skill.title} style={{ width: "100%", maxHeight: 170, objectFit: "cover", borderRadius: 7, marginBottom: 12 }} />}
      {skill.description
        ? <p style={{ color: "var(--text-1)", fontSize: 14, lineHeight: 1.65, margin: 0 }}>{skill.description}</p>
        : <p style={{ color: "var(--text-3)", fontSize: 13, margin: 0, fontStyle: "italic" }}>No description.</p>}
      <PrimaryBtn onClick={onClose} style={{ marginTop: 18, width: "100%" }}>Close</PrimaryBtn>
    </Modal>
  );
}
