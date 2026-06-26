import { useMemo } from "react";
import ReactFlow, { Background, Controls } from "reactflow";
import type { Edge, Node } from "reactflow";

import type { Skill, Connection } from "../types";
import { buildTree } from "../utils/buildTree";
import { layoutTree } from "../utils/layoutTree";
import { connectionStyle } from "../utils/connectionStyle";
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
  connections?: Connection[];
  hoveredConnectionId?: string | null;
  showAllConnections?: boolean;
  onConnectionClick?: (connectionId: string) => void;
};

export default function SkillTree({ skills, rootId, isDark, onNodeClick, onEditNode, onDeleteNode, connections = [], hoveredConnectionId = null, showAllConnections = false, onConnectionClick }: Props) {
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

    // Cross-domain connection edges — only those whose BOTH endpoints are
    // currently on screen. Dashed amber, width + brightness scale with strength.
    const present = new Set(positioned.map((p) => p.id));
    const connEdges: Edge[] = connections
      .filter((c) => present.has(c.source) && present.has(c.target) && (showAllConnections || c.id === hoveredConnectionId))
      .map((c) => {
        const { width, opacity, color, glow } = connectionStyle(c.strength);
        return {
          id: c.id,
          source: c.source,
          target: c.target,
          type: "straight",
          animated: c.strength >= 80,
          data: { isConnection: true },
          style: {
            stroke: color,
            strokeWidth: width,
            strokeDasharray: "7 5",
            opacity,
            filter: glow ? `drop-shadow(0 0 4px ${color})` : undefined,
            cursor: "pointer",
          },
        };
      });

    return { nodes, edges: [...edges, ...connEdges] };
  }, [skills, rootId, onEditNode, onDeleteNode, connections, hoveredConnectionId, showAllConnections]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.08 }}
      minZoom={0.3}
      maxZoom={2}
      proOptions={{ hideAttribution: true }}
      onNodeClick={(_e, node) => onNodeClick(node.id)}
      onEdgeClick={(_e, edge) => { if (edge.data?.isConnection) onConnectionClick?.(edge.id); }}
    >
      <Background color={isDark ? "#1a1a1a" : "#e7e5e4"} gap={32} size={1} />
      <Controls style={{ background: "var(--bg-panel)", border: "1px solid var(--border)" }} />
    </ReactFlow>
  );
}
