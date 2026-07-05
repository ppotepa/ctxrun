import { CatalogEntry } from "./types.js";

/** Editors & terminal productivity tools. */
export const editorsCatalog: CatalogEntry[] = [
  {
    name: "vim",
    command: "vim",
    description: "Points Vim at the target user's vimrc.",
    checks: [{ name: "vim.rc", relativePath: ".vimrc" }]
  },
  {
    name: "neovim",
    command: "nvim",
    description: "Points Neovim at the target user's config.",
    checks: [{ name: "nvim.config", relativePath: ".config/nvim/init.vim" }]
  },
  {
    name: "tmux",
    command: "tmux",
    description: "Points tmux at the target user's config.",
    checks: [{ name: "tmux.conf", relativePath: ".tmux.conf" }]
  },
  {
    name: "starship",
    command: "starship",
    description: "Points the Starship prompt at the target user's config.",
    env: { STARSHIP_CONFIG: ".config/starship.toml" }
  },
  {
    name: "zoxide",
    command: "zoxide",
    description: "Points zoxide at the target user's data directory.",
    env: { _ZO_DATA_DIR: ".local/share/zoxide" }
  },
  {
    name: "fzf",
    command: "fzf",
    description: "Runs fzf with the target user's shell integration files.",
    checks: [{ name: "fzf.bash", relativePath: ".fzf.bash" }]
  },
  {
    name: "lazygit",
    command: "lazygit",
    description: "Points lazygit at the target user's config.",
    checks: [{ name: "lazygit.config", relativePath: ".config/lazygit/config.yml" }]
  },
  {
    name: "tig",
    command: "tig",
    description: "Points tig at the target user's tigrc.",
    checks: [{ name: "tig.rc", relativePath: ".tigrc" }]
  },
  {
    name: "tmuxinator",
    command: "tmuxinator",
    description: "Points tmuxinator at the target user's config directory.",
    checks: [{ name: "tmuxinator.config", relativePath: ".config/tmuxinator" }]
  }
];
