import { useState, useEffect } from "react";

export function useTheme() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  }, [isDark]);
  return { isDark, toggle: () => setIsDark((d) => !d) };
}

export function ThemeToggle({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      style={{ width: 44, height: 24, borderRadius: 12, border: "1px solid var(--border-md)", background: isDark ? "#1a1a1a" : "#e7e5e4", cursor: "pointer", position: "relative", flexShrink: 0, transition: "background 0.2s", padding: 0 }}
    >
      <div style={{ position: "absolute", top: 3, left: isDark ? 3 : 21, width: 16, height: 16, borderRadius: "50%", background: isDark ? "#6B7280" : "#00754A", transition: "left 0.2s, background 0.2s", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9 }}>
        {isDark ? "🌙" : "☀️"}
      </div>
    </button>
  );
}
