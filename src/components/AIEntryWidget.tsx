import { useState, useRef } from "react";
import type { Skill, Connection } from "../types";
import { parseSkillFromInput, findConnections } from "../utils/ai";
import { makeId } from "../utils/stats";

const COOLDOWN_MS = 5000;

type Props = { skills: Skill[]; onAdd: (s: Skill) => void; onConnections: (c: Connection[]) => void };

export function AIEntryWidget({ skills, onAdd, onConnections }: Props) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [linking, setLinking] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startCooldown() {
    setCooldown(COOLDOWN_MS / 1000);
    cooldownRef.current = setInterval(() => {
      setCooldown((s) => {
        if (s <= 1) { clearInterval(cooldownRef.current!); return 0; }
        return s - 1;
      });
    }, 1000);
  }

  async function handleSubmit() {
    const trimmed = input.trim();
    if (!trimmed || loading || cooldown > 0) return;
    setLoading(true);
    setError(null);
    setNote(null);
    try {
      const result = await parseSkillFromInput(trimmed, skills);
      const skill: Skill = {
        id: makeId(result.title),
        parent: result.parent,
        title: result.title,
        description: result.description,
        createdAt: new Date().toISOString(),
      };
      // Show the node immediately…
      onAdd(skill);
      setInput("");
      startCooldown();
      setLoading(false);

      // …then discover its hidden cross-domain connections in the background.
      setLinking(true);
      try {
        const found = await findConnections(skill, [...skills, skill]);
        onConnections(found);
        setNote(
          found.length
            ? `Found ${found.length} hidden connection${found.length !== 1 ? "s" : ""} — see the Full Tree.`
            : `Added “${skill.title}”. No strong cross-domain links yet.`
        );
      } catch (e) {
        console.error("Connection discovery error:", e);
        setNote(`Added “${skill.title}”.`);
      } finally {
        setLinking(false);
      }
    } catch (e) {
      console.error("AI error:", e);
      setError(e instanceof Error ? e.message : "Couldn't parse that — try rephrasing.");
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Describe what you learned… (e.g. built a Flask REST API)"
          style={{
            background: "var(--bg-input)",
            border: `1px solid ${error ? "#ef4444" : "var(--border-md)"}`,
            borderRadius: 7,
            color: "var(--text-1)",
            fontSize: 12,
            padding: "9px 12px",
            outline: "none",
            width: "100%",
            fontFamily: "system-ui, sans-serif",
          }}
        />
        {error && <div style={{ color: "#ef4444", fontSize: 11 }}>{error}</div>}
        {!error && linking && (
          <div style={{ color: "var(--text-3)", fontSize: 11, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "hsl(38,95%,55%)", display: "inline-block", animation: "bounce 1s ease-in-out infinite" }} />
            Mapping hidden connections…
          </div>
        )}
        {!error && !linking && note && <div style={{ color: "var(--text-3)", fontSize: 11 }}>{note}</div>}
      </div>
      <button
        onClick={handleSubmit}
        disabled={loading || !input.trim() || cooldown > 0}
        style={{
          background: loading || !input.trim() || cooldown > 0 ? "var(--border)" : "var(--green)",
          border: "none",
          borderRadius: 7,
          color: loading || !input.trim() || cooldown > 0 ? "var(--text-3)" : "#fff",
          fontSize: 12,
          fontWeight: 600,
          padding: "9px 14px",
          cursor: loading || !input.trim() || cooldown > 0 ? "default" : "pointer",
          fontFamily: "system-ui, sans-serif",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        {loading ? "…" : cooldown > 0 ? `${cooldown}s` : "Add →"}
      </button>
    </div>
  );
}
