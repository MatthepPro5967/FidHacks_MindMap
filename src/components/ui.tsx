import React from "react";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={{ background: "var(--bg-input)", border: "1px solid var(--border-md)", borderRadius: 6, color: "var(--text-1)", fontSize: 13, padding: "8px 12px", outline: "none", width: "100%", fontFamily: "system-ui, sans-serif", ...props.style }} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} style={{ background: "var(--bg-input)", border: "1px solid var(--border-md)", borderRadius: 6, color: "var(--text-1)", fontSize: 13, padding: "8px 12px", outline: "none", width: "100%", fontFamily: "system-ui, sans-serif", cursor: "pointer" }} />;
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span style={{ color: "var(--text-3)", fontSize: 11, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.07em", marginTop: 10 }}>{children}</span>;
}

export function PrimaryBtn({ children, onClick, style }: { children: React.ReactNode; onClick?: () => void; style?: React.CSSProperties }) {
  return <button onClick={onClick} style={{ background: "var(--green)", border: "none", borderRadius: 6, color: "#fff", fontSize: 13, fontWeight: 600, padding: "9px 18px", cursor: "pointer", fontFamily: "system-ui, sans-serif", ...style }}>{children}</button>;
}

export function SecondaryBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return <button onClick={onClick} style={{ background: "transparent", border: "1px solid var(--border-md)", borderRadius: 6, color: "var(--text-2)", fontSize: 13, padding: "9px 18px", cursor: "pointer", fontFamily: "system-ui, sans-serif" }}>{children}</button>;
}

export function AppHeader({ left, right }: { left?: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div style={{ background: "var(--bg-panel)", borderBottom: "1px solid var(--border)", padding: "14px 24px", display: "flex", alignItems: "center", gap: 14, minHeight: 62 }}>
      {left}
      <div style={{ flex: 1 }} />
      {right}
    </div>
  );
}

export function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 50, background: "var(--modal-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 10, padding: "26px 28px 24px", width: 360, maxWidth: "90vw", maxHeight: "80vh", overflowY: "auto", fontFamily: "system-ui, sans-serif", display: "flex", flexDirection: "column", gap: 6 }}
      >
        <h2 style={{ margin: "0 0 14px", color: "var(--text-1)", fontSize: 17, fontWeight: 700 }}>{title}</h2>
        {children}
      </div>
    </div>
  );
}
