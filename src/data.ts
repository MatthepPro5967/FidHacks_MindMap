import type { Skill } from "./types";

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
];
