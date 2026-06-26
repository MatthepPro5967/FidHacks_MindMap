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

export type BadgeTier = "bronze" | "silver" | "gold" | "platinum" | "ruby" | "first-step" | "tree-builder" | "deep-roots";

export const BADGES: {
  id: string;
  name: string;
  desc: string;
  tier: BadgeTier;
  unlocked: (skills: Skill[]) => boolean;
}[] = [
  // Milestone tier badges — bronze → ruby
  {
    id: "bronze",
    name: "Bronze",
    desc: "Map your first skill",
    tier: "bronze",
    unlocked: (skills) => skills.length >= 1,
  },
  {
    id: "silver",
    name: "Silver",
    desc: "Reach 5 skills",
    tier: "silver",
    unlocked: (skills) => skills.length >= 5,
  },
  {
    id: "gold",
    name: "Gold",
    desc: "Reach 10 skills",
    tier: "gold",
    unlocked: (skills) => skills.length >= 10,
  },
  {
    id: "platinum",
    name: "Platinum",
    desc: "Reach 25 skills",
    tier: "platinum",
    unlocked: (skills) => skills.length >= 25,
  },
  {
    id: "ruby",
    name: "Ruby",
    desc: "Reach 50 skills",
    tier: "ruby",
    unlocked: (skills) => skills.length >= 50,
  },
  // Achievement badges
  {
    id: "first-step",
    name: "First Step",
    desc: "Add your first skill",
    tier: "first-step",
    unlocked: (skills) => skills.length >= 1,
  },
  {
    id: "tree-builder",
    name: "Tree Builder",
    desc: "Build a tree with 5+ skills",
    tier: "tree-builder",
    unlocked: (skills) => skills.filter((s) => s.parent !== null).length >= 5,
  },
  {
    id: "deep-roots",
    name: "Deep Roots",
    desc: "Reach 3 levels of depth",
    tier: "deep-roots",
    unlocked: (skills) => maxDepth(skills) >= 3,
  },
];
