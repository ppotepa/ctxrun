# ctxrun

`ctxrun` is a console application for running tools with an explicit user context across `sudo` and `root` boundaries.

The first target use case is running tools such as Codex with elevated privileges while keeping the original user's Git, GitHub CLI, SSH, and application configuration.

## Problem

On Linux, a normal user and `root` have separate home directories and therefore separate configuration:

```text
/home/user/.config/gh
/home/user/.gitconfig
/home/user/.ssh

/root/.config/gh
/root/.gitconfig
/root/.ssh
```

When a tool is started through `sudo`, it often starts reading configuration from `/root` instead of the original user's home directory. This creates several practical problems:

- GitHub CLI may appear logged in for the user, but logged out for `root`.
- Git commits may use `root` identity instead of the expected author.
- SSH agent authentication may stop working.
- Files created by automated tools may become owned by `root`.
- Credential helpers and keyrings may diverge between user and `root`.

`ctxrun` exists to make this behavior explicit, inspectable, and configurable.

## Goal

The goal is not to blindly preserve the whole environment. That would be hard to audit and can be unsafe.

Instead, `ctxrun` builds a minimal environment patch from application-specific plugins and presets.

Example:

```bash
ctxrun run codex
```

The `codex` preset can combine these plugins:

```text
base + git + gh + ssh + codex
```

Each plugin contributes only the environment variables and checks required for its responsibility.

## Commands

```bash
ctxrun run <preset|command> [...args] [--dry-run]
ctxrun explain <preset|command>
ctxrun doctor
ctxrun plugins list
```

Examples:

```bash
ctxrun run codex
ctxrun run gh auth status
ctxrun run git status
ctxrun run codex-aws --dry-run
ctxrun explain codex
ctxrun doctor
ctxrun plugins list
```

## Concepts

### Core

The core is intentionally small. It is responsible for:

- detecting the current user,
- detecting the original sudo user,
- resolving the target user's home directory,
- loading presets and plugins,
- building the environment patch,
- running the target process.

The core should not contain special cases for tools such as `codex`, `gh`, or `git`.

### Plugin

A plugin describes one integration concern.

Examples:

- `base`: user home and XDG directories,
- `git`: Git global config,
- `gh`: GitHub CLI config,
- `ssh`: SSH agent socket,
- `codex`: Codex application home,
- `copilot`: GitHub Copilot CLI home,
- `gemini`: Gemini CLI home,
- `claude`: Claude Code CLI config directory,
- `npm`: npm config and cache,
- `cargo`: Cargo/rustup toolchain home,
- `docker`: Docker CLI config and credential store,
- `kubectl`: kubeconfig,
- `aws`: AWS CLI credentials and config,
- `gcloud`: Google Cloud CLI config,
- `python`: pip config and Python user base.

A plugin can provide:

- environment variables,
- diagnostics,
- warnings,
- future setup or repair actions.

### Preset

A preset is a named composition of plugins for a specific application.

Examples:

```text
codex -> base + git + gh + ssh + codex
gh    -> base + gh
git   -> base + git + ssh
copilot -> base + git + gh + ssh + copilot
gemini  -> base + git + gh + ssh + gemini
claude  -> base + git + gh + ssh + claude
npm     -> base + npm
cargo   -> base + cargo
docker  -> base + docker
kubectl -> base + kubectl
aws     -> base + aws
gcloud  -> base + gcloud
python  -> base + python
```

Presets can also `extend` another preset, merging plugin lists and inheriting
the command if omitted. This composes cross-cutting contexts without
duplicating plugin lists:

```text
codex-aws   extends codex, plugins += [aws]
codex-cloud extends codex, plugins += [aws, gcloud, kubectl]
```

This keeps application-specific behavior outside the core while still giving users simple commands.

### Registry

The registry (`src/context/registry.ts`) is the single source of truth for
plugins and presets. It merges built-in sources today and is the seam where
future external sources (user-level `~/.config/ctxrun/`, project-local
`.ctxrunrc.json`) will be merged in without touching the resolution logic in
`resolve-run.ts`. It also resolves preset `extends` chains, deduplicating
merged plugin lists and inheriting the parent's `command` when omitted.

### Dry run

`ctxrun run <preset> --dry-run` resolves the environment and prints it
without executing the target process. It shares its output formatting with
`ctxrun explain`.

## Built-in Presets

### `codex`

Runs Codex with the target user's context:

```text
HOME
XDG_CONFIG_HOME
XDG_CACHE_HOME
XDG_DATA_HOME
GIT_CONFIG_GLOBAL
GH_CONFIG_DIR
SSH_AUTH_SOCK
CODEX_HOME
```

### `copilot`

Runs GitHub Copilot CLI with the target user's context:

```text
HOME
XDG_CONFIG_HOME
XDG_CACHE_HOME
XDG_DATA_HOME
GIT_CONFIG_GLOBAL
GH_CONFIG_DIR
SSH_AUTH_SOCK
COPILOT_HOME
```

### `gemini`

Runs Gemini CLI with the target user's context:

```text
HOME
XDG_CONFIG_HOME
XDG_CACHE_HOME
XDG_DATA_HOME
GIT_CONFIG_GLOBAL
GH_CONFIG_DIR
SSH_AUTH_SOCK
GEMINI_HOME
```

### `claude`

Runs Claude Code CLI with the target user's context:

```text
HOME
XDG_CONFIG_HOME
XDG_CACHE_HOME
XDG_DATA_HOME
GIT_CONFIG_GLOBAL
GH_CONFIG_DIR
SSH_AUTH_SOCK
CLAUDE_CONFIG_DIR
```

### `gh`

Runs GitHub CLI with the target user's GitHub CLI configuration:

```text
HOME
XDG_CONFIG_HOME
GH_CONFIG_DIR
```

### `git`

Runs Git with the target user's global Git configuration and SSH agent:

```text
HOME
GIT_CONFIG_GLOBAL
SSH_AUTH_SOCK
```

## Current Status

This repository currently contains the initial TypeScript scaffold:

- CLI command routing,
- built-in plugin model,
- built-in presets,
- environment resolution,
- `explain`,
- `doctor`,
- basic process runner.

The first implementation runs the target command with a patched environment. The next milestone is a stricter sudo/root runner.

## Planned Behavior

The intended behavior is:

```bash
ctxrun run codex
```

When executed from a sudo/root context, `ctxrun` should:

1. detect the original user from `SUDO_USER`,
2. resolve that user's home directory,
3. load the `codex` preset,
4. apply only the environment variables from selected plugins,
5. run `codex` as the intended effective user/root context,
6. provide clear diagnostics through `ctxrun explain` and `ctxrun doctor`.

## Development

Requirements:

- Node.js `>=20`
- npm

Install dependencies:

```bash
npm install
```

Build:

```bash
npm run build
```

Run locally:

```bash
node dist/cli.js explain codex
node dist/cli.js plugins list
node dist/cli.js doctor
```

## Distribution Plan

The planned distribution channels are:

- npm package for global installs,
- GitHub Releases for versioned artifacts,
- `.deb` package for Debian/Ubuntu,
- full APT repository later.

Expected install paths:

```bash
npm install -g ctxrun
sudo apt install ctxrun
```

## Roadmap

### Milestone 1

- TypeScript/npm scaffold.
- Built-in plugin and preset model.
- `run`, `explain`, `doctor`, `plugins list`.
- Basic local build.

### Milestone 2

- Dedicated sudo/root runner.
- Dry-run mode.
- Safer environment allowlist.
- Better diagnostics for `gh`, `git`, and SSH.

### Milestone 3

- External plugin loading.
- User configuration profiles.
- npm package release.
- GitHub Release artifacts.

### Milestone 4

- `.deb` packaging.
- APT repository.
- Signed release checksums.
