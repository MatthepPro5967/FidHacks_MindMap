export interface Skill {
  id: string;
  parent: string | null;
  title: string;
  description?: string;
  date?: string;
  image?: string;
  createdAt?: string; // ISO timestamp, set automatically on add
}

// A cross-domain bridge between two skills that live in different branches.
// Discovered by the AI, not drawn by the hierarchy.
export interface Connection {
  id: string;
  source: string;   // skill id
  target: string;   // skill id
  strength: number;  // 0-100 — how strong the AI rates the link
  summary: string;   // the emergent capability the two skills produce together
  createdAt?: string;
}

export interface TreeNode extends Skill {
  children: TreeNode[];
}

export interface PositionedNode extends Skill {
  x: number;
  y: number;
  depth: number;
}
