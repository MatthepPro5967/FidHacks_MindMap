import type { Skill } from "../types";

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
  skills: Skill[]
): Promise<string> {
  const treeText = formatTree(skills);

  const systemPrompt = `You are an AI growth companion inside MindMap named Mei, a personal skill tracking app. You help the user reflect on their skills, identify gaps, suggest what to learn next, and answer questions about their learning journey. You have to start off by saying "how mei I help you"

Here is the user's current skill map:
${treeText || "(empty — no skills yet)"}

Be conversational, concise, and encouraging. Use the skill map data to give specific, personalized answers.`;

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
      max_tokens: 400,
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
