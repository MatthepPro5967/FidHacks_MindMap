import { useMemo } from "react";
import ReactFlow, { Background, Controls } from "reactflow";
import type { Edge, Node } from "reactflow";

import type { Skill } from "../types";
import { buildTree } from "../utils/buildTree";
import { layoutTree } from "../utils/layoutTree";
import SkillNode, { DEPTH_COLORS } from "./SkillNode";

const NODE_SIZES = [96, 78, 72, 68, 64];
const nodeTypes = { custom: SkillNode };

function getSubtree(skills: Skill[], rootId: string): Skill[] {
  const result: Skill[] = [];
  const queue = [rootId];
  const map = new Map(skills.map((s) => [s.id, s]));
  const childMap = new Map<string, Skill[]>();
  for (const s of skills) {
    if (s.parent) {
      if (!childMap.has(s.parent)) childMap.set(s.parent, []);
      childMap.get(s.parent)!.push(s);
    }
  }
  while (queue.length) {
    const id = queue.shift()!;
    const node = map.get(id);
    if (node) {
      result.push(id === rootId ? { ...node, parent: null } : node);
      childMap.get(id)?.forEach((c) => queue.push(c.id));
    }
  }
  return result;
}

type Props = {
  skills: Skill[];
  rootId: string;
  isDark: boolean;
  onNodeClick: (skillId: string) => void;
  onEditNode?: (skillId: string) => void;
  onDeleteNode?: (skillId: string) => void;
};

export default function SkillTree({ skills, rootId, isDark, onNodeClick, onEditNode, onDeleteNode }: Props) {
  const { nodes, edges } = useMemo(() => {
    const subtree = getSubtree(skills, rootId);
    const tree = buildTree(subtree);
    if (!tree) return { nodes: [], edges: [] };

    const positioned = layoutTree(tree);
    const skillMap = new Map(subtree.map((s) => [s.id, s]));

    const nodes: Node[] = positioned.map((n) => {
      const size = NODE_SIZES[Math.min(n.depth, NODE_SIZES.length - 1)];
      const half = size / 2;
      return {
        id: n.id,
        position: { x: n.x - half, y: n.y - half },
        data: {
          label: n.title,
          depth: n.depth,
          hasImage: !!skillMap.get(n.id)?.image,
          id: n.id,
          onEdit: onEditNode,
          onDelete: onDeleteNode,
        },
        type: "custom",
        style: { width: size, height: size },
      };
    });

    const edges: Edge[] = subtree
      .filter((s) => s.parent !== null)
      .map((s) => {
        const parentDepth = positioned.find((p) => p.id === s.parent)?.depth ?? 0;
        const color = DEPTH_COLORS[Math.min(parentDepth, DEPTH_COLORS.length - 1)];
        return {
          id: `${s.parent}-${s.id}`,
          source: s.parent!,
          target: s.id,
          type: "straight",
          style: { stroke: color.border, strokeWidth: 1.5, opacity: 0.4 },
        };
      });

    return { nodes, edges };
  }, [skills, rootId, onEditNode, onDeleteNode]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.3 }}
      minZoom={0.3}
      maxZoom={2}
      proOptions={{ hideAttribution: true }}
      onNodeClick={(_e, node) => onNodeClick(node.id)}
    >
      <Background color={isDark ? "#1a1a1a" : "#e7e5e4"} gap={32} size={1} />
      <Controls style={{ background: "var(--bg-panel)", border: "1px solid var(--border)" }} />
    </ReactFlow>
  );
}
