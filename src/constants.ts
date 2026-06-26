import type { Skill } from "./types";
import { maxDepth } from "./utils/stats";

export const VIRTUAL_ROOT = "__all__";

export const MILESTONES: { count: number; label: string }[] = [
  { count: 1,  label: "First step" },
  { count: 5,  label: "Getting started" },
  { count: 10, label: "Building momentum" },
  { count: 25, label: "Deep mapper" },
  { count: 50, label: "Skill architect" },
];

export const BADGES = [
  {
    id: "first-step",
    name: "First Step",
    desc: "Add your first skill",
    image: "/badges/first-step.png",
    unlocked: (skills: Skill[]) => skills.length >= 1,
  },
  {
    id: "tree-builder",
    name: "Tree Builder",
    desc: "Build a tree with 5+ skills",
    image: "/badges/tree-builder.png",
    unlocked: (skills: Skill[]) => skills.filter((s) => s.parent !== null).length >= 5,
  },
  {
    id: "deep-roots",
    name: "Deep Roots",
    desc: "Reach 3 levels of depth",
    image: "/badges/deep-roots.png",
    unlocked: (skills: Skill[]) => maxDepth(skills) >= 3,
  },
];
