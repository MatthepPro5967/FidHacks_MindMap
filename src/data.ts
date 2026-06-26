import type { Skill, Connection } from "./types";

export const skills: Skill[] = [
  // Programming tree
  { id: "programming", parent: null, title: "Programming" },
  { id: "python", parent: "programming", title: "Python" },
  { id: "javascript", parent: "programming", title: "JavaScript" },
  { id: "web", parent: "programming", title: "Web Dev" },
  { id: "react", parent: "javascript", title: "React" },
  { id: "node", parent: "javascript", title: "Node.js" },
  { id: "flask", parent: "python", title: "Flask" },
  { id: "numpy", parent: "python", title: "NumPy" },

  // Design tree
  { id: "design", parent: null, title: "Design" },
  { id: "figma", parent: "design", title: "Figma" },
  { id: "ux", parent: "design", title: "UX Research" },

  // Fishing tree (7 nodes — one 4-layer branch, two shallow branches)
  { id: "fishing", parent: null, title: "Fishing", description: "The pursuit of fish through reading water, mastering gear, and understanding species behavior." },

  // ── Freshwater branch ────────────────────────────────────────────────────
  { id: "freshwater-fishing", parent: "fishing", title: "Freshwater Fishing", description: "Pursuing fish in lakes, rivers, and streams using environment-specific techniques." },
  { id: "bass-lures", parent: "freshwater-fishing", title: "Lure Selection", description: "Matching artificial lures to fish behavior, water clarity, season, and structure." },

  // ── Shallow branches off root ─────────────────────────────────────────────
  { id: "saltwater-fishing", parent: "fishing", title: "Saltwater Fishing", description: "Chasing fish in tidal flats, bays, and open ocean — a completely different game than freshwater." },
  { id: "fishing-gear", parent: "fishing", title: "Gear & Tackle", description: "Rods, reels, line, and terminal tackle — the tools that connect angler to fish." },
];

// Cross-domain bridges between skills in different trees. These are the
// invisible connections a resume can't show — varying in strength.
export const connections: Connection[] = [
  {
    id: "conn-flask-react",
    source: "flask",
    target: "react",
    strength: 84,
    summary: "Designing the API and consuming it in the UI — the two halves that make you a full-stack product builder.",
  },
  {
    id: "conn-react-figma",
    source: "react",
    target: "figma",
    strength: 76,
    summary: "Component-driven code and design systems share the same atomic, reusable building-block mindset.",
  },
  {
    id: "conn-web-design",
    source: "web",
    target: "design",
    strength: 68,
    summary: "Translating visual intent into responsive layouts bridges design craft and implementation.",
  },
  {
    id: "conn-numpy-ux",
    source: "numpy",
    target: "ux",
    strength: 52,
    summary: "Numerical analysis and user research both turn raw observation into evidence for decisions.",
  },
  {
    id: "conn-python-figma",
    source: "python",
    target: "figma",
    strength: 31,
    summary: "Scripting can automate the generation of design assets and prototypes at scale.",
  },

  // Programming ↔ Fishing
  {
    id: "conn-python-bassLures",
    source: "python",
    target: "bass-lures",
    strength: 71,
    summary: "Pattern-matching lure selection to bass behavior borrows the same decision-tree logic as classification algorithms — read the conditions, pick the model.",
  },
  {
    id: "conn-node-saltwater",
    source: "node",
    target: "saltwater-fishing",
    strength: 52,
    summary: "Real-time data pipelines that stream tide, weather, and bait-movement data mirror the live sensor aggregation needed to fish tidal windows precisely.",
  },

  // Design ↔ Fishing
  {
    id: "conn-ux-readingwater",
    source: "ux",
    target: "freshwater-fishing",
    strength: 67,
    summary: "Both disciplines demand silent observation of an environment to read behavioral cues and predict what a fish — or a user — will do next.",
  },
  {
    id: "conn-figma-gear",
    source: "figma",
    target: "fishing-gear",
    strength: 44,
    summary: "Selecting and organizing tackle systems requires the same component-hierarchy thinking as building a Figma design system — every piece must fit the larger setup.",
  },
];
