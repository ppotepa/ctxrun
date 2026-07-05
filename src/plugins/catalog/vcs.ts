import { CatalogEntry } from "./types.js";

/**
 * Version control & code-hosting CLIs. `git` and `gh` also have
 * hand-composed presets in presets/index.ts (base+git+ssh, base+gh) so
 * their auto-generated 1:1 preset is suppressed via `standalonePreset: false`.
 */
export const vcsCatalog: CatalogEntry[] = [
  {
    name: "git",
    command: "git",
    description: "Points Git at the target user's global config.",
    env: { GIT_CONFIG_GLOBAL: ".gitconfig" },
    checks: [{ name: "git.config", relativePath: ".gitconfig" }],
    standalonePreset: false
  },
  {
    name: "gh",
    command: "gh",
    description: "Points GitHub CLI at the target user's config directory.",
    env: { GH_CONFIG_DIR: ".config/gh" },
    checks: [{ name: "gh.hosts", relativePath: ".config/gh/hosts.yml" }],
    standalonePreset: false
  },
  {
    name: "glab",
    command: "glab",
    description: "Points the GitLab CLI at the target user's config.",
    checks: [{ name: "glab.config", relativePath: ".config/glab-cli/config.yml" }]
  },
  {
    name: "hub",
    command: "hub",
    description: "Points hub at the target user's config directory.",
    checks: [{ name: "hub.config", relativePath: ".config/hub" }]
  },
  {
    name: "git-lfs",
    command: "git-lfs",
    description: "Runs Git LFS with the target user's Git config (see the git preset).",
    checks: [{ name: "git.config", relativePath: ".gitconfig" }]
  },
  {
    name: "svn",
    command: "svn",
    description: "Points Subversion at the target user's config directory.",
    checks: [{ name: "svn.home", relativePath: ".subversion" }]
  },
  {
    name: "hg",
    command: "hg",
    description: "Points Mercurial at the target user's hgrc.",
    checks: [{ name: "hg.rc", relativePath: ".hgrc" }]
  }
];
