import { Preset } from "../registry/types.js";
import { catalog } from "../plugins/catalog/index.js";

// Presets that need a plugin combination the catalog can't express 1:1
// (extra ssh/git/gh context, or an `extends` chain). Every other tool gets
// its preset auto-generated below from a single catalog entry.
const handComposedPresets: Preset[] = [
  {
    name: "codex",
    command: "codex",
    plugins: ["base", "git", "gh", "ssh", "codex"],
    description: "Run Codex as root while preserving user Git, GitHub CLI, SSH, and Codex context."
  },
  {
    name: "gh",
    command: "gh",
    plugins: ["base", "gh"],
    description: "Run GitHub CLI with the target user's gh config."
  },
  {
    name: "git",
    command: "git",
    plugins: ["base", "git", "ssh"],
    description: "Run Git with the target user's global config and SSH agent."
  },
  {
    name: "copilot",
    command: "copilot",
    plugins: ["base", "git", "gh", "ssh", "copilot"],
    description: "Run GitHub Copilot CLI as root while preserving user Git, GitHub CLI, SSH, and Copilot context."
  },
  {
    name: "gemini",
    command: "gemini",
    plugins: ["base", "git", "gh", "ssh", "gemini"],
    description: "Run Gemini CLI as root while preserving user Git, GitHub CLI, SSH, and Gemini context."
  },
  {
    name: "claude",
    command: "claude",
    plugins: ["base", "git", "gh", "ssh", "claude"],
    description: "Run Claude Code CLI as root while preserving user Git, GitHub CLI, SSH, and Claude context."
  },
  {
    name: "codex-aws",
    extends: "codex",
    plugins: ["aws"],
    description: "Codex preset extended with AWS CLI credentials."
  },
  {
    name: "codex-cloud",
    extends: "codex",
    plugins: ["aws", "gcloud", "kubectl"],
    description: "Codex preset extended with AWS, Google Cloud, and kubectl context."
  }
];

// One preset per catalog entry (`base` + the tool's own plugin, running the
// tool's own binary), unless the entry opted out because a hand-composed
// preset above already covers it under the same name. This is what gets
// ctxrun to ~100 everyday dev presets without hand-writing each one.
const catalogPresets: Preset[] = catalog
  .filter((entry) => entry.standalonePreset !== false)
  .map((entry) => ({
    name: entry.name,
    command: entry.command,
    plugins: ["base", entry.name],
    description: entry.description
  }));

export const builtInPresets: Preset[] = [...handComposedPresets, ...catalogPresets];
