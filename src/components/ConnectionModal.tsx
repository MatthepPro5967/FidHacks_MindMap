import type { Connection, Skill } from "../types";
import { Modal, PrimaryBtn } from "./ui";
import { connectionStyle, strengthLabel } from "../utils/connectionStyle";

type Props = {
  connection: Connection;
  skills: Skill[];
  onClose: () => void;
};

export function ConnectionModal({ connection, skills, onClose }: Props) {
  const titleById = new Map(skills.map((s) => [s.id, s.title]));
  const a = titleById.get(connection.source) ?? connection.source;
  const b = titleById.get(connection.target) ?? connection.target;
  const { color, width } = connectionStyle(connection.strength);

  return (
    <Modal title="Discovered Connection" onClose={onClose}>
      {/* Endpoints */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: -4, marginBottom: 16 }}>
        <span style={{ flex: 1, textAlign: "center", background: "var(--bg-input)", color: "var(--text-1)", fontSize: 13, fontWeight: 600, borderRadius: 6, padding: "8px 10px" }}>{a}</span>
        <div style={{ width: 34, height: width + 2, borderRadius: 99, background: color, flexShrink: 0 }} />
        <span style={{ flex: 1, textAlign: "center", background: "var(--bg-input)", color: "var(--text-1)", fontSize: 13, fontWeight: 600, borderRadius: 6, padding: "8px 10px" }}>{b}</span>
      </div>

      {/* Strength meter */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ color: "var(--text-3)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>Connection strength</span>
        <span style={{ color, fontSize: 12, fontWeight: 700 }}>{strengthLabel(connection.strength)} · {connection.strength}/100</span>
      </div>
      <div style={{ height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden", marginBottom: 16 }}>
        <div style={{ height: "100%", width: `${connection.strength}%`, background: color, borderRadius: 3 }} />
      </div>

      {/* Emergent capability */}
      <div style={{ color: "var(--text-3)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Emergent capability</div>
      <p style={{ color: "var(--text-1)", fontSize: 14, lineHeight: 1.65, margin: 0 }}>{connection.summary}</p>

      <PrimaryBtn onClick={onClose} style={{ marginTop: 18, width: "100%" }}>Close</PrimaryBtn>
    </Modal>
  );
}
