import { Preset } from "../context/types.js";
import { catalog } from "../plugins/catalog.js";

const handWrittenPresets: Preset[] = [
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
    name: "npm",
    command: "npm",
    plugins: ["base", "npm"],
    description: "Run npm with the target user's .npmrc and cache directory."
  },
  {
    name: "cargo",
    command: "cargo",
    plugins: ["base", "cargo"],
    description: "Run Cargo with the target user's toolchain and registry home."
  },
  {
    name: "docker",
    command: "docker",
    plugins: ["base", "docker"],
    description: "Run Docker CLI with the target user's config and credential store."
  },
  {
    name: "kubectl",
    command: "kubectl",
    plugins: ["base", "kubectl"],
    description: "Run kubectl with the target user's kubeconfig."
  },
  {
    name: "aws",
    command: "aws",
    plugins: ["base", "aws"],
    description: "Run AWS CLI with the target user's credentials and config."
  },
  {
    name: "gcloud",
    command: "gcloud",
    plugins: ["base", "gcloud"],
    description: "Run Google Cloud CLI with the target user's config directory."
  },
  {
    name: "python",
    command: "python3",
    plugins: ["base", "python"],
    description: "Run Python/pip with the target user's pip config and user base."
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

// One preset per catalog entry: `base` + the tool's own plugin, running the
// tool's own binary. This is what gets ctxrun to ~100 everyday dev presets
// without hand-writing each one.
const catalogPresets: Preset[] = catalog.map((entry) => ({
  name: entry.name,
  command: entry.command,
  plugins: ["base", entry.name],
  description: entry.description
}));

export const builtInPresets: Preset[] = [...handWrittenPresets, ...catalogPresets];
