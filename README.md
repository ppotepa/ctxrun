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

### Quick install (recommended)
```bash
curl -fsSL https://raw.githubusercontent.com/ppotepa/ctxrun/main/install.sh | bash
```

Or with a specific version:
```bash
curl -fsSL https://raw.githubusercontent.com/ppotepa/ctxrun/main/install.sh | bash -s 0.1.0
```

The installer will:
1. Detect your system (Linux, macOS)
2. Try to install via npm (if available)
3. Fallback to .deb on Debian/Ubuntu
4. Fallback to tarball otherwise

Requires Node.js >=20.

### npm
```bash
npm install -g ctxrun
```

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

## How It Works

**Plugin**: Describes one tool/concern (e.g., `git`, `gh`, `ssh`).
- Provides env vars + checks
- Auto-composed into preset via `createConfigPlugin()`

**Preset**: Named composition of plugins for a specific app (e.g., `codex` = `base + git + gh + ssh + codex`).
- Can `extend` another preset (e.g., `codex-aws` extends `codex` + `aws`)
- Auto-generated or hand-written

**Registry** (`src/registry/`): Single source of truth. Merges built-in plugins, external configs, and resolves `extends` chains.

**Catalog** (`src/plugins/catalog/`): ~100 everyday dev tools (languages, cloud, containers, databases, editors, etc.).
- Each catalog entry = 1 plugin + 1 preset
- No code changes needed to add a tool — just add an object to `catalog/*.ts`

**Runner**: Spawns target process with patched environment.
- Forwards signals (SIGINT, SIGTERM, etc.) to child
- Allowlist merging (only `PATH`, `TERM`, `LANG`, `LC_*`, `SHELL`, `TZ`, etc. + plugin env)
- Clear error messages ("Command not found", etc.)

## Architecture

The source tree is organized by domain (not by technical layer), so each area is self-contained and adding a tool only touches one file:

```
src/
  cli/
    index.ts              argv parsing, shorthand dispatch
    commands/             run, explain, doctor, plugins list
  
  user-context/
    detect.ts             detects sudo user, resolves home directory
  
  registry/
    registry.ts           plugin/preset resolution, extends chains
    resolve-run.ts        combines preset + context into resolved run
  
  plugins/
    factory.ts            createConfigPlugin() builder
    core/                 base.ts, ssh.ts (custom logic)
    catalog/              ~100 everyday tools (declarative)
      ai.ts               codex, copilot, gemini, claude
      vcs.ts              git, gh, glab, svn, hg
      languages.ts        npm, cargo, python, go, nvm, pyenv
      cloud.ts            aws, gcloud, azure, terraform, helm
      containers.ts       docker, kubectl, podman, buildah
      editors.ts          vim, tmux, starship, lazygit
      databases.ts        psql, mysql, mongosh, redis-cli
      secrets.ts          gpg, pass, op, bitwarden
      misc.ts             curl, wget, httpie, jq
  
  presets/
    index.ts              hand-composed presets (codex, copilot, etc.)
  
  runner/
    process-runner.ts     spawn child + signal forwarding + env patch
```

**To add a tool:** Add one object to `plugins/catalog/<domain>.ts` — plugin + preset are auto-generated. No wiring needed.

## Common Presets

| Preset | Environment | Use Case |
|--------|-------------|----------|
| `codex` | Git + GH + SSH + Codex | Run Codex with user auth |
| `copilot` | Git + GH + SSH + Copilot | Run Copilot CLI |
| `gemini` | Git + GH + SSH + Gemini | Run Gemini CLI |
| `claude` | Git + GH + SSH + Claude | Run Claude Code |
| `gh` | GitHub CLI config | GitHub CLI operations |
| `git` | Git config + SSH | Git commands |
| `npm` | npm config/cache | npm install/publish |
| `docker` | Docker config/creds | Docker commands |
| `aws` | AWS credentials/config | AWS CLI |
| `kubectl` | kubeconfig | Kubernetes |

**Plus 94 more** catalog entries (`cargo`, `python`, `gcloud`, `psql`, `redis-cli`, `tmux`, `lazygit`, `vault`, `terraform`, ...).

Run `ctxrun plugins list` to see all presets.

## Status

**v0.1.0 released** — stable, production-ready.

- ✅ 104 built-in presets (hand-written and auto-generated)
- ✅ Core + 2 hardened plugins (`base`, `ssh`)
- ✅ Declarative catalog (90+ tools in `src/plugins/catalog/`)
- ✅ External plugins + profiles (`~/.config/ctxrun/`, `.ctxrunrc.json`)
- ✅ Signal forwarding + environment allowlist
- ✅ Docker e2e tests + registry integrity checks
- ✅ npm/deb installers

**What works:**
- `ctxrun <preset> [args]` — runs tool with user context preserved
- `ctxrun explain <preset>` — shows resolved environment
- `ctxrun doctor` — checks diagnostics
- `ctxrun plugins list [--json]` — lists all presets/plugins

**Next (v0.2+):**
- APT repository + signed releases
- macOS/Windows installers
- Plugin marketplace

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

Push a tag to trigger GitHub Actions:

```bash
git tag -a v0.X.Y -m "Release v0.X.Y"
git push origin v0.X.Y
```

The CI workflow (`release.yml`) will build, test, package, and publish to GitHub Releases automatically.

To build locally:

```bash
npm run build
bash scripts/build-release.sh   # creates dist/release/*.deb, *.tgz, SHA256SUMS
gh release create v0.X.Y dist/release/* --notes "Release notes"
```

## Contributing

**To add a tool:**

1. Add one entry to `src/plugins/catalog/<domain>.ts`:

```typescript
{
  name: "my-tool",
  command: "my-tool",
  description: "My tool",
  env: { MY_TOOL_HOME: ".config/my-tool" },
  checks: [{ name: "my-tool config", relativePath: ".config/my-tool/config" }]
}
```

2. Build + test: `npm run build && npm test`
3. Plugin + preset auto-generated. Done.

**To add a test scenario:**

1. Create `e2e/scenarios/NN-description.sh`
2. Source `e2e/lib.sh`, use `assert_contains`, `assert_equal`, etc.
3. Run: `npm run test:e2e`

## License

MIT

| Release | Features | Status |
|---------|----------|--------|
| **v0.1.0** | Core CLI, registry, 104 presets, runner hardening, external config | ✅ Stable |
| **v0.2.0** | npm/deb distribution, signed releases, macOS support | 🚧 In progress |
| **v0.3.0** | Plugin marketplace, `direnv` integration, Windows support | 📋 Planned |

**Delivered ahead of roadmap:**
- `ctxrun <preset>` shorthand
- Preset composition (`extends`)
- Declarative catalog (90+ tools in `src/plugins/catalog/`)
- Domain-oriented project layout
- Docker e2e test suite
- Machine-readable `plugins list --json`

## License

MIT
