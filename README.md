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
ctxrun codex
```

The `codex` preset can combine these plugins:

```text
base + git + gh + ssh + codex
```

Each plugin contributes only the environment variables and checks required for its responsibility.

## Commands

```bash
ctxrun <preset|command> [...args] [--dry-run]   # shorthand for "run"
ctxrun run <preset|command> [...args] [--dry-run]
ctxrun explain <preset|command>
ctxrun doctor
ctxrun plugins list
```

The first form is shorthand: `ctxrun codex` is equivalent to `ctxrun run codex`.
Reserved top-level words (`run`, `explain`, `doctor`, `plugins`) are always
treated as commands, never as preset names — a preset can't be named one of
these.

Examples:

```bash
ctxrun codex
ctxrun gh auth status
ctxrun git status
ctxrun codex-aws --dry-run
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

### Everyday dev tool catalog

Beyond the hand-written presets above, `src/plugins/catalog.ts` declares
~90 additional presets for everyday developer CLIs — language toolchains
(`go`, `gradle`, `pyenv`, `nvm`, `poetry`, ...), cloud/infra CLIs (`azure`,
`terraform`, `pulumi`, `helm`, `vault`, ...), container tools (`podman`,
`docker-compose`, ...), VCS helpers (`glab`, `hub`, `hg`, ...), editors/shell
tools (`vim`, `tmux`, `starship`, ...), databases (`psql`, `mysql`,
`mongosh`, ...), secrets managers (`gpg`, `pass`, `op`, `bitwarden`), and
more. Each is `base` + one declarative plugin built by
`createConfigPlugin()` (`src/plugins/factory.ts`) from a small spec (env
vars and/or config-file checks), instead of a hand-written module per tool.
Combined with the hand-written presets, `ctxrun plugins list` reports over
100 presets in total.

Run `ctxrun plugins list --json` for a machine-readable dump of every
plugin and preset — this is what the e2e suite uses to dry-run every single
preset automatically (see below).

To add a new tool, add one object to the `catalog` array; it becomes both a
plugin and a preset with no further wiring.

## Current Status

Beyond the initial scaffold, `ctxrun` now has:

- CLI command routing, with `ctxrun <preset>` shorthand for `ctxrun run <preset>`,
- built-in plugin model, generated either by hand (`base`, `git`, `gh`, `ssh`, `codex`, ...) or declaratively via `createConfigPlugin()` from `src/plugins/catalog.ts`,
- 104 built-in presets (12 hand-written + 2 `extends`-composed + 89 catalog-driven), covering AI CLIs, language toolchains, cloud/infra CLIs, containers, VCS helpers, editors, databases, and secrets managers,
- a `registry.ts` as the single source of truth for plugins/presets, resolving `extends` chains,
- environment resolution, `explain`, `run --dry-run`, `doctor`, `plugins list [--json]`,
- a basic process runner (still a plain `spawn`, not yet a dedicated sudo/root runner — see below),
- unit tests (`node:test`) guarding registry integrity, and a Docker/Debian e2e suite that dry-runs every registered preset under `sudo`.

Known gaps versus the "Planned Behavior" below:

- The runner merges the full `process.env` with the plugin-provided patch (see `src/runner/process-runner.ts`) rather than applying *only* the selected plugins' variables. There is no allowlist yet.
- There's no dedicated sudo/root runner beyond reading `SUDO_USER` in `detectUserContext()` — see Milestone 2.

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

## Unit tests

`src/context/registry.test.ts` uses Node's built-in test runner (`node:test`,
no extra dependency) to guard the registry itself as the catalog grows:
no duplicate plugin/preset names, no preset shadowing a reserved CLI word,
every preset resolving to a real command with known plugins, every preset
including `base`, `extends` pointers resolving to a real parent, and every
plugin having a name/description.

```bash
npm run test:unit
```

## End-to-end tests

`e2e/` contains a Docker-based e2e suite that exercises `ctxrun` the way it is
actually meant to be used: a non-root user (`devuser`) with seeded Git/GitHub
CLI/AWS/kubectl/Docker/gcloud/pip config in their home directory, running
`sudo ctxrun <preset>`. Scenarios assert that the resulting environment
reflects `devuser`'s context, not `root`'s.

```bash
npm run test:e2e
```

This builds a Debian-based image (`e2e/Dockerfile`) with `ctxrun` linked
globally, then runs every script in `e2e/scenarios/*.sh` inside the
container via `e2e/run-e2e.sh`, printing a pass/fail summary and exiting
non-zero if any scenario fails. Scenarios covered today:

- `codex` preset preserves the target user's HOME/Git/GitHub/Codex context under `sudo`.
- `extends`-based presets (`codex-aws`, `codex-cloud`) correctly merge plugin lists.
- `ctxrun <preset>` shorthand produces identical output to `ctxrun run <preset>`.
- `doctor` reports `ok` for every seeded config file.
- `plugins list` shows composed presets with their fully merged plugin list.
- Running without `sudo` uses the current user's own context (no `SUDO_USER`).
- **Every single registered preset** (100+, driven by `ctxrun plugins list --json`) dry-runs successfully under `sudo` with `devuser`'s `HOME`, never `root`'s. This one scenario scales automatically as the catalog grows — no per-tool scenario needed.
- The preset catalog has at least 100 entries.

`npm test` runs unit tests followed by the e2e suite.

Add new scenarios by dropping another `NN-description.sh` script into
`e2e/scenarios/`; it will be picked up automatically. Scripts can source
`e2e/lib.sh` for `assert_contains`/`assert_not_contains`/`assert_equal`
helpers.

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

### Milestone 1 — done

- [x] TypeScript/npm scaffold.
- [x] Built-in plugin and preset model.
- [x] `run`, `explain`, `doctor`, `plugins list`.
- [x] Basic local build.

### Milestone 2 — in progress

- [ ] Dedicated sudo/root runner (currently a plain `spawn`; `SUDO_USER` only affects env resolution, not process launching/privilege handling).
- [x] Dry-run mode (`ctxrun run <preset> --dry-run`, shares output with `explain`).
- [ ] Safer environment allowlist (currently merges full `process.env` with the plugin patch — see `src/runner/process-runner.ts`).
- [x] Better diagnostics for `gh` and `git` (`doctor` checks). `ssh` still has no check, only a note when `SSH_AUTH_SOCK` is unset.

### Milestone 3 — not started

- [ ] External plugin loading (`registry.ts` is the prepared seam — it merges built-in sources today — but nothing yet reads `~/.config/ctxrun/` or a project-local `.ctxrunrc.json`).
- [ ] User configuration profiles.
- [ ] npm package release.
- [ ] GitHub Release artifacts.

### Milestone 4 — not started

- [ ] `.deb` packaging.
- [ ] APT repository.
- [ ] Signed release checksums.

### Delivered ahead of the original roadmap

- `ctxrun <preset>` shorthand for `ctxrun run <preset>`.
- Preset composition via `extends` (e.g. `codex-aws`, `codex-cloud`).
- `plugins list --json` for machine-readable/scriptable output.
- A ~90-entry declarative catalog (`src/plugins/catalog.ts` + `createConfigPlugin()`) covering everyday dev tools, bringing the total to 104 built-in presets.
- Unit tests (`node:test`) guarding registry integrity.
- A Docker/Debian e2e suite (`e2e/`) that dry-runs every registered preset under `sudo` and asserts the target user's context is used.
