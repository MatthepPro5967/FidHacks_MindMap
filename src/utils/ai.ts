import type { Skill, Connection } from "../types";

const MODEL = "llama-3.1-8b-instant";

function formatTree(skills: Skill[]): string {
  const lines: string[] = [];

  function walk(parentId: string | null, indent: number) {
    const children = skills.filter((s) => s.parent === parentId);
    for (const s of children) {
      const pad = "  ".repeat(indent);
      const desc = s.description ? ` — ${s.description}` : "";
      lines.push(`${pad}- id="${s.id}" | ${s.title}${desc}`);
      walk(s.id, indent + 1);
    }
  }

  walk(null, 0);
  return lines.join("\n");
}

// Returns the id of the root ancestor of a skill — used to tell which
// top-level tree a skill belongs to.
function rootOf(skills: Skill[], id: string): string {
  let cur = skills.find((s) => s.id === id);
  while (cur?.parent) {
    const next = skills.find((s) => s.id === cur!.parent);
    if (!next) break;
    cur = next;
  }
  return cur?.id ?? id;
}

// A flat "id | Title (in TreeName)" listing — gives the model the domain of
// each skill so it can reason about CROSS-domain links.
function formatFlatWithTree(skills: Skill[]): string {
  const titleById = new Map(skills.map((s) => [s.id, s.title]));
  return skills
    .map((s) => {
      const root = rootOf(skills, s.id);
      const tree = titleById.get(root) ?? "—";
      const desc = s.description ? ` — ${s.description}` : "";
      return `- id="${s.id}" | ${s.title} (tree: ${tree})${desc}`;
    })
    .join("\n");
}

function formatConnections(skills: Skill[], connections: Connection[]): string {
  if (!connections.length) return "(none discovered yet)";
  const titleById = new Map(skills.map((s) => [s.id, s.title]));
  return connections
    .map((c) => {
      const a = titleById.get(c.source) ?? c.source;
      const b = titleById.get(c.target) ?? c.target;
      return `- ${a} ↔ ${b} (strength ${c.strength}/100): ${c.summary}`;
    })
    .join("\n");
}

export interface TreeAnalysis {
  summary: string;
  strengths: string[];
  gaps: { area: string; action: string }[];
}

// Format connections that touch this tree with full detail — both endpoints
// named and scored — so the AI can reason about which bridges are strong
// and which are weak or missing.
function formatTreeConnections(
  treeSkillIds: Set<string>,
  allSkills: Skill[],
  connections: Connection[]
): string {
  const titleById = new Map(allSkills.map((s) => [s.id, s.title]));
  const relevant = connections.filter(
    (c) => treeSkillIds.has(c.source) || treeSkillIds.has(c.target)
  );
  if (!relevant.length) return "(no cross-domain connections yet)";
  return relevant
    .sort((a, b) => b.strength - a.strength)
    .map((c) => {
      const a = titleById.get(c.source) ?? c.source;
      const b = titleById.get(c.target) ?? c.target;
      const label = c.strength >= 70 ? "STRONG" : c.strength >= 45 ? "MODERATE" : "WEAK";
      return `- [${label} ${c.strength}/100] ${a} ↔ ${b}: ${c.summary}`;
    })
    .join("\n");
}

export async function analyzeTree(
  treeSkills: Skill[],   // skills belonging to just this tree
  allSkills: Skill[],    // full map — used to look up connection endpoints
  connections: Connection[],
  treeName: string
): Promise<TreeAnalysis> {
  const treeSkillIds = new Set(treeSkills.map((s) => s.id));

  // Overview source: the actual content of this tree's nodes
  const treeText = formatTree(treeSkills);

  // Strengths/gaps source: cross-domain connections that touch this tree
  const connText = formatTreeConnections(treeSkillIds, allSkills, connections);

  const systemPrompt = `You are MindMap's skill analyst. You have two distinct data sources — use each one for its designated section only.

SOURCE A — The actual skill tree content (titles and descriptions of every node in this tree). Use this ONLY for the "summary" field.
SOURCE B — Cross-domain connection data: bridges between this tree and other skill trees, each with a strength score (0-100) and an emergent-capability summary. Use this ONLY for "strengths" and "gaps".

Return ONLY this JSON shape:
{
  "summary": "<2-3 sentences derived entirely from SOURCE A: what the actual documented skills reveal about how this person thinks and builds. Name real skills and their descriptions. No generic filler.>",
  "strengths": [
    "<Emergent capability produced by a STRONG or MODERATE connection from SOURCE B. Quote the connection summary and explain why it matters. Name the specific skills on both ends.>",
    "<Another strong connection from SOURCE B — what does it unlock?>",
    "<Optional third if a third strong connection exists>"
  ],
  "gaps": [
    { "area": "<label>", "action": "<Specific next step to strengthen a WEAK connection from SOURCE B, or to create a missing bridge — name the two skills, the current strength score if it exists, and what project or skill addition would raise it.>" },
    { "area": "<label>", "action": "<Another weak or missing bridge from SOURCE B — concrete action to strengthen it.>" }
  ]
}

Critical rules:
- summary must reference real skill names and descriptions from SOURCE A. Never reference connections here.
- strengths and gaps must reference real connection data from SOURCE B — strength scores, skill names on both sides. Never invent connections that are not in SOURCE B.
- If SOURCE B has no strong connections, say so honestly in strengths and focus gaps on what bridges are missing.
- Tight, specific language. No filler sentences.`;

  const userMsg = `Tree: "${treeName}"

SOURCE A — Skills in this tree:
${treeText || "(empty)"}

SOURCE B — Cross-domain connections involving this tree:
${connText}`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${import.meta.env.VITE_GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMsg },
      ],
      max_tokens: 600,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `API error ${response.status}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(text) as TreeAnalysis;

  function coerceString(v: unknown): string {
    if (typeof v === "string") return v;
    if (v && typeof v === "object") {
      const o = v as Record<string, unknown>;
      return String(o.description ?? o.text ?? o.title ?? o.summary ?? JSON.stringify(v));
    }
    return String(v ?? "");
  }

  const rawGaps = Array.isArray(parsed.gaps) ? parsed.gaps : [];
  const gaps = rawGaps.slice(0, 3).map((g: unknown) => {
    if (g && typeof g === "object") {
      const o = g as Record<string, unknown>;
      return { area: String(o.area ?? ""), action: String(o.action ?? o.description ?? o.text ?? "") };
    }
    return { area: "", action: String(g ?? "") };
  });

  return {
    summary: typeof parsed.summary === "string" ? parsed.summary : coerceString(parsed.summary),
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths.filter(Boolean).slice(0, 3).map(coerceString) : [],
    gaps,
  };
}

export interface AISkillResult {
  title: string;
  parent: string | null;
  description: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function chatWithTree(
  message: string,
  history: ChatMessage[],
  skills: Skill[],
  connections: Connection[] = []
): Promise<string> {
  const treeText = formatTree(skills);
  const connText = formatConnections(skills, connections);

  const systemPrompt = `You are an AI growth companion inside MindMap named Mei, a personal skill tracking app. You help the user reflect on their skills, identify gaps, suggest what to learn next, and answer questions about their learning journey. You have to start off by saying "how mei I help you"

The whole point of MindMap is the HIDDEN connections between skills in different domains — the invisible bridges a resume can never show. When relevant, point out these cross-domain connections and the emergent capabilities they create.

Here is the user's current skill map:
${treeText || "(empty — no skills yet)"}

Cross-domain connections discovered so far:
${connText}

Be conversational, concise, and encouraging. Use both the skill map AND the connections to give specific, personalized answers. When a connection is weak, you can suggest a concrete next action (a project, collaboration, or skill) that would strengthen the bridge.

STRICT LIMIT: Keep every response under 200 words. Use bullet points (- item) for lists. Use **bold** for emphasis. Be tight and direct — no filler sentences.`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${import.meta.env.VITE_GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        ...history.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: message },
      ],
      max_tokens: 280,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `API error ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "Sorry, I couldn't generate a response.";
}

export async function parseSkillFromInput(
  userInput: string,
  skills: Skill[]
): Promise<AISkillResult> {
  const treeText = formatTree(skills);

  const systemPrompt = `You are a skill mapping assistant. Given what a user learned, add it to their skill map.

IMPORTANT RULES:
1. ALWAYS try to attach the new skill under an existing one if there is ANY reasonable connection.
2. Only set parent to null if the skill is completely unrelated to everything in the map.
3. Use the EXACT id value from the map — copy it character-for-character.
4. Return ONLY a JSON object with three fields: title, parent, description.
5. title: 2-4 words, title case.
6. description: one sentence.

EXAMPLE:
If the map has:  id="python" | Python
And user says:   "learned pandas for data analysis"
You return:      {"title": "Pandas", "parent": "python", "description": "Library for data manipulation and analysis in Python."}

EXAMPLE:
If the map has:  id="javascript" | JavaScript
And user says:   "built a react component"
You return:      {"title": "React Components", "parent": "javascript", "description": "Building reusable UI components with React."}

EXAMPLE (no match):
If user says:    "learned how to fish"
And nothing in the map relates to fishing or outdoors:
You return:      {"title": "Fishing", "parent": null, "description": "Catching fish using rods, bait, and technique."}

CURRENT SKILL MAP:
${treeText || "(empty — no skills yet)"}`;

  console.log("Sending to AI:\n", systemPrompt);

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${import.meta.env.VITE_GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userInput },
      ],
      max_tokens: 150,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `API error ${response.status}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content ?? "";
  console.log("AI returned:", text);

  const result = JSON.parse(text) as AISkillResult;

  // Validate parent ID actually exists
  if (result.parent && !skills.find((s) => s.id === result.parent)) {
    console.warn(`AI returned unknown parent id "${result.parent}", setting to null`);
    result.parent = null;
  }

  return result;
}

interface RawConnection {
  target: string;
  strength: number;
  summary: string;
}

// Given a freshly-added skill and the full map, find the subtle cross-domain
// bridges between this skill and existing skills in OTHER branches. Each link
// gets a 0-100 strength and a one-sentence emergent-capability summary.
export async function findConnections(
  newSkill: Skill,
  allSkills: Skill[]
): Promise<Connection[]> {
  // Everything except the new node itself.
  const others = allSkills.filter((s) => s.id !== newSkill.id);
  if (others.length === 0) return [];

  const newRoot = rootOf(allSkills, newSkill.id);
  // Direct ancestors/descendants are already linked by the hierarchy — exclude.
  const lineage = new Set<string>();
  let cur: Skill | undefined = newSkill;
  while (cur?.parent) { lineage.add(cur.parent); cur = allSkills.find((s) => s.id === cur!.parent); }

  const candidates = others.filter((s) => !lineage.has(s.id));
  const flatText = formatFlatWithTree(candidates);
  const newDesc = newSkill.description ? ` — ${newSkill.description}` : "";

  const systemPrompt = `You are MindMap's connection engine. Your job is to find the HIDDEN, NON-OBVIOUS bridges between a person's skills that live in DIFFERENT domains. A resume shows skills in isolation; you reveal the invisible connective tissue between them.

The user just added this skill:
  id="${newSkill.id}" | ${newSkill.title}${newDesc} (tree: ${rootOf(allSkills, newSkill.id) === newSkill.id ? newSkill.title : "see map"})

Here are their other skills, each tagged with the tree (domain) it belongs to:
${flatText}

TASK: Identify at most 2 of the STRONGEST cross-domain connections between the new skill and the skills above.

RULES:
1. STRONGLY prefer skills in a DIFFERENT tree than the new skill (the new skill's tree id is "${newRoot}"). Cross-domain links are the entire point. Only link within the same tree if the bridge is genuinely insightful and non-obvious.
2. Do NOT restate the obvious hierarchy. Find the subtle, emergent link — what capability appears ONLY when these two are combined.
3. strength is 0-100: 80-100 = a powerful, defining combination; 50-79 = a real, useful bridge; 1-49 = a faint or latent link worth noticing.
4. summary: ONE sentence naming the emergent capability the two skills create together (e.g. "translating complex data into clarity for non-technical audiences"). Be specific and concrete, not generic.
5. Use the EXACT id from the list, copied character-for-character.
6. Return ONLY JSON: {"connections": [{"target": "<id>", "strength": <number>, "summary": "<sentence>"}]}. If there are genuinely no meaningful connections, return {"connections": []}.

EXAMPLE:
New skill: Data Visualization (tree: Programming)
Other skills include: Creative Writing (tree: Writing), UX Research (tree: Design)
Return: {"connections": [
  {"target": "creative-writing", "strength": 72, "summary": "Turning dense data into a narrative non-technical audiences actually feel."},
  {"target": "ux-research", "strength": 64, "summary": "Designing charts around how real users read and misread information."}
]}`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${import.meta.env.VITE_GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Find the cross-domain connections for "${newSkill.title}".` },
      ],
      max_tokens: 200,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `API error ${response.status}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content ?? "{}";
  console.log("Connections returned:", text);

  let raw: RawConnection[];
  try {
    const parsed = JSON.parse(text) as { connections?: RawConnection[] };
    raw = Array.isArray(parsed.connections) ? parsed.connections.slice(0, 2) : [];
  } catch {
    return [];
  }

  const validIds = new Set(candidates.map((s) => s.id));
  const seen = new Set<string>();
  const result: Connection[] = [];

  for (const r of raw) {
    if (!r || typeof r.target !== "string") continue;
    if (!validIds.has(r.target) || seen.has(r.target)) continue;
    seen.add(r.target);
    const strength = Math.max(1, Math.min(100, Math.round(Number(r.strength) || 0)));
    result.push({
      id: `conn-${newSkill.id}-${r.target}`,
      source: newSkill.id,
      target: r.target,
      strength,
      summary: typeof r.summary === "string" && r.summary.trim() ? r.summary.trim() : "A cross-domain link between these skills.",
      createdAt: new Date().toISOString(),
    });
  }

  return result.slice(0, 2);
}
