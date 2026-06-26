export interface Skill {
  id: string;
  parent: string | null;
  title: string;
  description?: string;
  date?: string;
  image?: string;
  createdAt?: string; // ISO timestamp, set automatically on add
}

export interface TreeNode extends Skill {
  children: TreeNode[];
}

export interface PositionedNode extends Skill {
  x: number;
  y: number;
  depth: number;
}
