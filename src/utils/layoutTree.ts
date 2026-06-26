import type { TreeNode, PositionedNode } from "../types";

const RADIUS_GAP = 200;

export function layoutTree(root: TreeNode): PositionedNode[] {
  const result: PositionedNode[] = [];

  function walk(
    node: TreeNode,
    depth: number,
    angleStart: number,
    angleEnd: number
  ) {
    const angle = (angleStart + angleEnd) / 2;
    const radius = depth * RADIUS_GAP;

    result.push({
      id: node.id,
      parent: node.parent,
      title: node.title,
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle),
      depth,
    });

    const count = node.children.length;
    if (count === 0) return;

    const slice = (angleEnd - angleStart) / count;
    node.children.forEach((child, i) => {
      walk(child, depth + 1, angleStart + i * slice, angleStart + (i + 1) * slice);
    });
  }

  walk(root, 0, 0, Math.PI * 2);
  return result;
}
