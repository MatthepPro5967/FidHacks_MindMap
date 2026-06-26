import type { Skill } from "../types";

export function countDescendants(skills: Skill[], id: string): number {
  const children = skills.filter((s) => s.parent === id);
  return children.length + children.reduce((n, c) => n + countDescendants(skills, c.id), 0);
}

export function makeId(title: string): string {
  return title.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
}

export function maxDepth(skills: Skill[]): number {
  let max = 0;
  function walk(id: string, d: number) {
    if (d > max) max = d;
    skills.filter((s) => s.parent === id).forEach((c) => walk(c.id, d + 1));
  }
  skills.filter((s) => s.parent === null).forEach((r) => walk(r.id, 0));
  return max;
}

export function mostRecentSkill(skills: Skill[]): Skill | null {
  const withDate = skills.filter((s) => s.createdAt);
  if (!withDate.length) return skills[skills.length - 1] ?? null;
  return withDate.reduce((a, b) => (a.createdAt! > b.createdAt! ? a : b));
}

export function localDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function todayStr(): string {
  return localDateStr(new Date());
}

export function getDepth(skills: Skill[], id: string): number {
  let depth = 0;
  let cur = skills.find((s) => s.id === id);
  while (cur?.parent) { depth++; cur = skills.find((s) => s.id === cur!.parent); }
  return depth;
}

export function getSubtreeIds(skills: Skill[], rootId: string): Set<string> {
  const ids = new Set<string>();
  const queue = [rootId];
  while (queue.length) {
    const id = queue.shift()!;
    ids.add(id);
    skills.filter((s) => s.parent === id).forEach((c) => queue.push(c.id));
  }
  return ids;
}
