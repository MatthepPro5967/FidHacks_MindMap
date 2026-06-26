export function UserAvatar({ name }: { name: string }) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--green)", border: "2px solid var(--border-md)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: "0.03em", flexShrink: 0 }}>
        {initials}
      </div>
      <div style={{ lineHeight: 1.3 }}>
        <div style={{ color: "var(--text-1)", fontSize: 13, fontWeight: 600 }}>{name}</div>
        <div style={{ color: "var(--text-3)", fontSize: 10 }}>Skill Map</div>
      </div>
    </div>
  );
}
