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

## Installation

### npm
```bash
npm install -g ctxrun
```

Requires Node.js >=20.

### .deb (Debian/Ubuntu)
Download from [GitHub Releases](https://github.com/ppotepa/ctxrun/releases):
```bash
sudo dpkg -i ctxrun_*.deb
```

### Manual (tarball)
```bash
tar xzf ctxrun-v*.tar.gz
export PATH=$PATH:$(pwd)/ctxrun/usr/bin
```

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

The registry (`src/registry/registry.ts`) is the single source of truth for
plugins and presets. It merges built-in sources today and is the seam where
future external sources (user-level `~/.config/ctxrun/`, project-local
`.ctxrunrc.json`) will be merged in without touching the resolution logic in
`resolve-run.ts`. It also resolves preset `extends` chains, deduplicating
merged plugin lists and inheriting the parent's `command` when omitted.

### Dry run

`ctxrun run <preset> --dry-run` resolves the environment and prints it
without executing the target process. It shares its output formatting with
`ctxrun explain`.

### Project structure

The source tree is organized by domain rather than by technical layer alone,
so each subdomain is self-contained and new tool integrations only ever touch
`src/plugins/catalog/`:

```text
src/
  cli/                  entry point, help text, and command handlers
    index.ts            argv parsing, shorthand dispatch
    help.ts             help text + reserved command words
    commands/
      run.ts             `ctxrun run` (+ shorthand) / --dry-run
      explain.ts          `ctxrun explain`
      doctor.ts           `ctxrun doctor`
      plugins.ts          `ctxrun plugins list` [--json]
      format.ts           shared "resolved run" output formatting

  user-context/         who is actually running ctxrun, and whose config to use
    types.ts             UserContext
    detect.ts             detects sudo/root, resolves target home directory

  registry/             plugin/preset resolution - the seam for future
                         external plugin sources
    types.ts              CtxPlugin, Preset, ResolvedRun, ...
    registry.ts            loadRegistry(), findPlugin/findPreset, extends resolution
    resolve-run.ts          combines a preset/command + UserContext into a ResolvedRun
    registry.test.ts        integrity tests (no dup names, no dangling extends, ...)

  plugins/
    factory.ts            createConfigPlugin(): declarative plugin builder
    core/                 the only two plugins with custom logic
      base.ts               HOME/USER/XDG_* from UserContext
      ssh.ts                conditional SSH_AUTH_SOCK passthrough
    catalog/               ~100 everyday dev tools, declared by domain
      index.ts               merges all category arrays into `catalog`
      types.ts                CatalogEntry (adds `command`, `standalonePreset`)
      ai.ts                   codex, copilot, gemini, claude
      vcs.ts                  git, gh, glab, hub, git-lfs, svn, hg
      languages.ts            npm, cargo, python, go, yarn, pnpm, ...
      cloud.ts                aws, gcloud, azure, terraform, helm, vault, ...
      containers.ts           docker, kubectl, podman, buildah, ...
      editors.ts              vim, neovim, tmux, starship, lazygit, ...
      databases.ts            psql, mysql, mongosh, redis-cli, ...
      secrets.ts              gpg, pass, op, bitwarden, sops
      misc.ts                 curl, wget, httpie, keychain

  presets/
    index.ts               hand-composed presets (need extra plugins/extends)
                           + one auto-generated preset per catalog entry

  runner/
    process-runner.ts      spawns the target process with the patched env
```

Everyday tools only ever require a new entry in the right `plugins/catalog/*.ts`
file - a `CtxPlugin` and its matching preset (`base` + the tool) are generated
automatically. Hand-written code (`plugins/core/`, `presets/index.ts`) is
reserved for the small number of tools that need custom logic or a
non-trivial plugin combination.

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

Beyond the hand-composed presets above, `src/plugins/catalog/` declares
~100 additional presets for everyday developer CLIs, split by domain into
`languages.ts`, `cloud.ts`, `containers.ts`, `vcs.ts`, `editors.ts`,
`databases.ts`, `secrets.ts`, `misc.ts`, and `ai.ts` — language toolchains
(`go`, `gradle`, `pyenv`, `nvm`, `poetry`, ...), cloud/infra CLIs (`azure`,
`terraform`, `pulumi`, `helm`, `vault`, ...), container tools (`podman`,
`docker-compose`, ...), VCS helpers (`glab`, `hub`, `hg`, ...), editors/shell
tools (`vim`, `tmux`, `starship`, ...), databases (`psql`, `mysql`,
`mongosh`, ...), secrets managers (`gpg`, `pass`, `op`, `bitwarden`), and
more. Each is `base` + one declarative plugin built by
`createConfigPlugin()` (`src/plugins/factory.ts`) from a small spec (env
vars and/or config-file checks), instead of a hand-written module per tool.
`ctxrun plugins list` reports over 100 presets in total.

Run `ctxrun plugins list --json` for a machine-readable dump of every
plugin and preset — this is what the e2e suite uses to dry-run every single
preset automatically (see below).

To add a new tool, add one object to the relevant `plugins/catalog/*.ts`
file; it becomes both a plugin and a preset with no further wiring. If the
tool needs a hand-composed preset instead (e.g. it needs `ssh` too), set
`standalonePreset: false` on its catalog entry and add the preset to
`presets/index.ts`.

## Current Status

**v0.1.0** — Stable release with core features:

- ✓ CLI routing: `ctxrun <preset>` shorthand for `ctxrun run <preset>`
- ✓ Built-in plugin model: hand-written (`base`, `ssh` in `src/plugins/core/`) or declarative via `createConfigPlugin()` from `src/plugins/catalog/`
- ✓ 104 built-in presets (12 hand-written + 2 `extends`-composed + 89 catalog-driven)
- ✓ Registry as single source of truth, resolving `extends` chains
- ✓ Environment resolution, `explain`, `run --dry-run`, `doctor`, `plugins list [--json]`
- ✓ **Milestone 2 (Runner hardening):**
  - Signal forwarding (SIGINT/SIGTERM/SIGHUP/SIGQUIT to child)
  - Proper signal-to-exit-code handling
  - Environment allowlist (PATH, TERM, LANG/LC_*, SHELL, TZ, etc.) instead of full process.env
  - Clear "Command not found" errors instead of stack traces
- ✓ **Milestone 3 (External plugins + user profiles):**
  - External plugin loading from `~/.config/ctxrun/plugins.json`, `~/.config/ctxrun/presets.json`, `.ctxrunrc.json`
  - User profile override system (`--profile` flag integration)
  - Tested end-to-end
- ✓ Unit tests (`node:test`) guarding registry integrity
- ✓ Docker/Debian e2e suite (9 scenarios) with automatic preset dry-run testing

## Planned: Next Milestones

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

## External Configuration

Users can customize and extend `ctxrun` with external plugins and presets without modifying the built-in code.

### User-level configuration

Create `~/.config/ctxrun/plugins.json` to define custom plugins:

```json
{
  "plugins": [
    {
      "name": "my-tool",
      "description": "My custom tool configuration",
      "env": {
        "MY_TOOL_HOME": ".config/my-tool"
      },
      "checks": [
        {
          "name": "my-tool config",
          "relativePath": ".config/my-tool/config"
        }
      ]
    }
  ]
}
```

Create `~/.config/ctxrun/presets.json` to define custom presets:

```json
{
  "presets": [
    {
      "name": "my-preset",
      "command": "my-tool",
      "plugins": ["base", "my-tool"]
    }
  ]
}
```

### Project-level configuration

Create `.ctxrunrc.json` in your project root to override presets or add project-specific tools:

```json
{
  "plugins": [
    {
      "name": "project-specific",
      "description": "Project setup",
      "env": {
        "PROJECT_ROOT": "."
      }
    }
  ],
  "presets": [
    {
      "name": "build",
      "command": "make",
      "plugins": ["base", "project-specific"]
    }
  ]
}
```

### User profiles

Create `~/.config/ctxrun/profiles.json` to define named profiles that override context detection:

```json
{
  "service-user": {
    "targetUser": "nginx",
    "targetHome": "/var/www"
  },
  "ci-build": {
    "targetUser": "buildbot",
    "targetHome": "/home/buildbot"
  }
}
```

Use a profile:

```bash
ctxrun --profile service-user run docker
ctxrun explain git --profile ci-build
```

### How merging works

- Built-in plugins and presets are the base.
- User-level `~/.config/ctxrun/plugins.json` and `~/.config/ctxrun/presets.json` are merged on top (last write wins by name).
- Project-level `.ctxrunrc.json` is merged on top of both.
- Profiles (`--profile <name>`) override the detected target user/home.

## Development

Requirements:

- Node.js `>=20`
- npm
- Docker (for e2e testing)

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
npm run dev -- explain codex
npm run dev -- plugins list
npm run dev -- doctor
```

### Tests

```bash
npm run test:unit          # Run registry integrity tests
npm run test:e2e           # Build e2e Docker image and run scenarios
npm run test               # Run all tests
```

### Making a release

```bash
bash scripts/build-release.sh
```

This builds `.deb` and tarballs, generates SHA256SUMS, and outputs instructions for creating a GitHub Release.

## Contributing

To add a new tool:

1. Add an entry to `src/plugins/catalog/<domain>.ts` (or create a new domain file if needed).
2. Run `npm run build` and `npm run test` to verify.
3. The plugin and preset are generated automatically.

To add a scenario:

1. Create `e2e/scenarios/NN-description.sh`.
2. Source `e2e/lib.sh` and use `assert_contains`, `assert_not_contains`, `assert_equal`.
3. Run `npm run test:e2e` to test.

## Distribution

Installation channels:

## Roadmap

### Milestone 1 — done

- [x] TypeScript/npm scaffold.
- [x] Built-in plugin and preset model.
- [x] `run`, `explain`, `doctor`, `plugins list`.
- [x] Basic local build.

### Milestone 2 — done

- [x] Dedicated runner hardening (`src/runner/process-runner.ts`): forwards SIGINT/SIGTERM/SIGHUP/SIGQUIT to the child, re-raises the child's exit signal instead of collapsing it to a generic status code, and reports a clear "Command not found" error instead of an unhandled ENOENT.
- [x] Dry-run mode (`ctxrun run <preset> --dry-run`, shares output with `explain`).
- [x] Environment allowlist: the runner now merges a small, explicit allowlist (`PATH`, `TERM`, `LANG`/`LC_*`, `SHELL`, `TZ`, ...) with the plugin env patch instead of the entire `process.env`. Plugin values always win.
- [x] Better diagnostics for `gh`, `git`, and `ssh` (`doctor` checks) — `ssh` now reports `ok`/`warn` based on whether `SSH_AUTH_SOCK` is set and reachable, not just a note.

### Milestone 3 — done

- [x] External plugin loading: `~/.config/ctxrun/plugins.json`, `~/.config/ctxrun/presets.json`, `.ctxrunrc.json`.
- [x] User configuration profiles (`--profile` flag).
- [ ] npm package release (ready, waiting for testing).
- [ ] GitHub Release artifacts (ready, waiting for first tag).

### Milestone 4 — in progress

- [x] `.deb` packaging (Dockerfile.release + fpm).
- [ ] APT repository (after first release).
- [ ] Signed release checksums (after first release).

### Future

- [ ] macOS/Windows installers.
- [ ] Plugin marketplace/registry.
- [ ] Integration with `direnv`, `asdf`, and other environment managers.

### Delivered ahead of the original roadmap

- `ctxrun <preset>` shorthand for `ctxrun run <preset>`.
- Preset composition via `extends` (e.g. `codex-aws`, `codex-cloud`).
- `plugins list --json` for machine-readable/scriptable output.
- A ~90-entry declarative catalog (`src/plugins/catalog/` + `createConfigPlugin()`) covering everyday dev tools, bringing the total to 104 built-in presets.
- Unit tests (`node:test`) guarding registry integrity.
- A Docker/Debian e2e suite (`e2e/`) that dry-runs every registered preset under `sudo` and asserts the target user's context is used.
- Domain-oriented source layout (`cli/`, `user-context/`, `registry/`, `plugins/core/` + `plugins/catalog/<domain>.ts`) — see [Project structure](#project-structure).
