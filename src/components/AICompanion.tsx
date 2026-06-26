import { useState, useRef, useEffect } from "react";
import React from "react";
import type { Skill, Connection } from "../types";
import { chatWithTree, type ChatMessage } from "../utils/ai";

type Props = { skills: Skill[]; connections?: Connection[] };

function renderMessage(text: string, isUser: boolean) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];

  function parseBold(line: string): React.ReactNode[] {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, i) =>
      p.startsWith("**") && p.endsWith("**")
        ? <strong key={i} style={{ fontWeight: 700 }}>{p.slice(2, -2)}</strong>
        : p
    );
  }

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) {
      elements.push(<div key={i} style={{ height: 4 }} />);
    } else if (/^[-•*]\s/.test(trimmed)) {
      elements.push(
        <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", marginTop: 3 }}>
          <span style={{ color: isUser ? "rgba(255,255,255,0.7)" : "var(--green)", flexShrink: 0, marginTop: 1, fontSize: 10 }}>●</span>
          <span>{parseBold(trimmed.replace(/^[-•*]\s/, ""))}</span>
        </div>
      );
    } else {
      elements.push(<div key={i} style={{ marginTop: i === 0 ? 0 : 4 }}>{parseBold(trimmed)}</div>);
    }
  });

  return elements;
}

export function AICompanion({ skills, connections = [] }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hi! Ask me anything about your skills — what to learn next, how your trees connect, or where to focus." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const reply = await chatWithTree(trimmed, messages, skills, connections);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong. Try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 0 }}>
      {/* Header */}
      <div style={{ padding: "0 0 12px 0", borderBottom: "1px solid var(--border)", marginBottom: 12 }}>
        <div style={{ color: "var(--text-1)", fontWeight: 700, fontSize: 14 }}>Mei</div>
        <div style={{ color: "var(--text-3)", fontSize: 11, marginTop: 2 }}>Ask about your skills, gaps, or what to learn next</div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: "85%",
                padding: "9px 12px",
                borderRadius: msg.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                background: msg.role === "user" ? "var(--green)" : "var(--bg-card)",
                border: msg.role === "user" ? "none" : "1px solid var(--border)",
                color: msg.role === "user" ? "#fff" : "var(--text-1)",
                fontSize: 12,
                lineHeight: 1.55,
              }}
            >
              {renderMessage(msg.content, msg.role === "user")}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ padding: "9px 14px", borderRadius: "12px 12px 12px 2px", background: "var(--bg-card)", border: "1px solid var(--border)", display: "flex", gap: 4, alignItems: "center" }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text-3)", animation: `bounce 1s ease-in-out ${i * 0.15}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: 8, paddingTop: 12, borderTop: "1px solid var(--border)", marginTop: 12 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask anything…"
          style={{ flex: 1, background: "var(--bg-input)", border: "1px solid var(--border-md)", borderRadius: 8, color: "var(--text-1)", fontSize: 12, padding: "8px 12px", outline: "none", fontFamily: "system-ui, sans-serif" }}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          style={{ background: loading || !input.trim() ? "var(--border)" : "var(--green)", border: "none", borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 600, padding: "8px 14px", cursor: loading || !input.trim() ? "default" : "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
