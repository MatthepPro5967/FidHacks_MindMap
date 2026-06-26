import type { Skill, TreeNode } from "../types";

export function buildTree(skills: Skill[]): TreeNode | null {
  const map = new Map<string, TreeNode>();

  // Create every node
  skills.forEach(skill => {
    map.set(skill.id, {
      ...skill,
      children: []
    });
  });

  let root: TreeNode | null = null;

  // Connect children to parents
  map.forEach(node => {
    if (node.parent === null) {
      root = node;
      return;
    }

    const parent = map.get(node.parent);

    if (parent) {
      parent.children.push(node);
    }
  });

  return root;
}