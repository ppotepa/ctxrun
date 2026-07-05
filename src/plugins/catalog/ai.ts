import { CatalogEntry } from "./types.js";

/**
 * AI coding assistant CLIs. Each also has a hand-composed preset in
 * presets/index.ts (base+git+gh+ssh+<tool>) so the auto-generated 1:1
 * preset is suppressed via `standalonePreset: false`.
 */
export const aiCatalog: CatalogEntry[] = [
  {
    name: "codex",
    command: "codex",
    description: "Points Codex at the target user's Codex home.",
    env: { CODEX_HOME: ".codex" },
    standalonePreset: false
  },
  {
    name: "copilot",
    command: "copilot",
    description: "Points GitHub Copilot CLI at the target user's Copilot home.",
    env: { COPILOT_HOME: ".copilot" },
    checks: [{ name: "copilot.home", relativePath: ".copilot" }],
    standalonePreset: false
  },
  {
    name: "gemini",
    command: "gemini",
    description: "Points Gemini CLI at the target user's Gemini home.",
    env: { GEMINI_HOME: ".gemini" },
    checks: [{ name: "gemini.home", relativePath: ".gemini" }],
    standalonePreset: false
  },
  {
    name: "claude",
    command: "claude",
    description: "Points Claude Code CLI at the target user's Claude config directory.",
    env: { CLAUDE_CONFIG_DIR: ".claude" },
    checks: [{ name: "claude.home", relativePath: ".claude" }],
    standalonePreset: false
  }
];
