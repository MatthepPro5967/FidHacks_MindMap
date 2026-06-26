/**
 * install.js
 *
 * Installs every dependency this project needs.
 *
 * HOW TO RUN:
 *   node install.js
 *
 * (Requires Node.js + npm to already be installed on your machine.)
 *
 * This just wraps `npm install`, which reads the full dependency list
 * below (and exact version ranges) from package.json.
 *
 * Dependencies installed:
 *   - @google/genai    (Google Gemini SDK)
 *   - react            (UI library)
 *   - react-dom        (React renderer for the browser)
 *   - reactflow        (skill-tree graph visualization)
 *
 * Dev dependencies installed:
 *   - @tailwindcss/vite     (Tailwind CSS Vite plugin)
 *   - @types/node           (Node type defs)
 *   - @types/react          (React type defs)
 *   - @types/react-dom      (React-DOM type defs)
 *   - @vitejs/plugin-react  (Vite's React plugin)
 *   - oxlint                (linter)
 *   - tailwindcss           (CSS framework)
 *   - typescript            (TS compiler)
 *   - vite                  (dev server / build tool)
 */

import { execSync } from "child_process";

console.log("Installing dependencies via npm install...\n");

try {
  execSync("npm install", { stdio: "inherit" });
  console.log("\nAll dependencies installed. Run `npm run dev` to start the app.");
} catch (err) {
  console.error("\nnpm install failed. Make sure Node.js and npm are installed and on your PATH.");
  process.exit(1);
}
