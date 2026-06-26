// Maps a connection's strength (0-100) to its visual encoding.
// Stronger = thicker + brighter; weaker = thinner + dimmer.
// Cross-domain links use a warm amber so they stand apart from the
// solid green hierarchy edges.
export function connectionStyle(strength: number) {
  const t = Math.max(0, Math.min(1, strength / 100));
  const width = 1.5;                     // uniform — size never changes
  const opacity = 0.7;                   // uniform
  // Color ramp: cool gray (weak) → amber (moderate) → bright green (strong)
  let color: string;
  if (t < 0.45) {
    // Faint / Emerging: muted gray-blue
    color = `hsl(220, 10%, ${55 + t * 20}%)`;
  } else if (t < 0.7) {
    // Moderate: warm amber
    const p = (t - 0.45) / 0.25;
    color = `hsl(38, 90%, ${48 + p * 8}%)`;
  } else {
    // Strong / Defining: bright green (matches the app's green system)
    const p = (t - 0.7) / 0.3;
    color = `hsl(153, 100%, ${34 + p * 10}%)`;
  }
  const glow = true;
  return { t, width, opacity, color, glow };
}

export function strengthLabel(strength: number): string {
  if (strength >= 80) return "Defining";
  if (strength >= 65) return "Strong";
  if (strength >= 45) return "Moderate";
  if (strength >= 25) return "Emerging";
  return "Faint";
}
