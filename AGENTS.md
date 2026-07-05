# AGENTS.md

This file is read automatically by AI coding agents (GitHub Copilot CLI, Codex CLI,
Claude Code, etc.) that support the `AGENTS.md` convention. Its presence in a
directory means: **"the project I need to work on is whatever lives in this
current directory"** — this file is intentionally generic and portable, not
tied to any specific project name or codebase. Copy it as-is into any
repository root.

If you are an agent reading this: follow it. If something here conflicts with a
direct user instruction in the current session, the user instruction wins.

---

## 1. Orient yourself before changing anything

Don't assume you know this codebase. On start of any non-trivial task:

- Look for existing docs first: `README.md`, `docs/`, `CONTRIBUTING.md`,
  `ARCHITECTURE.md`, any `PLAN.md`/`SUMMARY.md` at repo root. Treat these as the
  primary source of truth for structure/conventions, ahead of guessing from file
  layout alone.
- Identify the language/toolchain from manifest files present (e.g. `go.mod`,
  `package.json`, `pyproject.toml`/`requirements.txt`, `Cargo.toml`, `pom.xml`,
  `*.csproj`) rather than assuming one stack.
- Check whether the directory is a git repository (`git status`). If it isn't,
  don't invent version-control assumptions — there's nothing to commit/branch,
  and file moves/renames are plain filesystem operations.
- Look for a lockfile/CI config (`.github/workflows/*`, `Makefile`,
  `Justfile`, `Taskfile.yml`) to discover the *actual* build/test/lint commands
  used by this project instead of guessing generic ones.

---

## 2. Build, test, lint

Use whatever build/test/lint commands this specific project actually defines
(Makefile targets, package.json scripts, etc.) — discover them first per §1.
Whichever command you land on, prefer running it through the `rtk` proxy (see
§4) to save context:

```bash
rtk <build-command>     # e.g. rtk npm run build / rtk go build ./... / rtk cargo build
rtk <test-command>       # e.g. rtk npm test / rtk go test ./... / rtk pytest
rtk <lint-command>       # e.g. rtk eslint . / rtk golangci-lint run / rtk ruff check
```

Only use linters/build tools/test frameworks the project already has configured.
Don't add new ones as a side effect of an unrelated task.

---

## 3. General coding conventions (apply unless the project's own docs say otherwise)

- Match the existing code style, naming, and file organization already present
  in the project — don't introduce a different convention "because it's
  better" without asking.
- Keep business logic out of UI/presentation layers; keep data-access logic
  (SQL, HTTP calls, file I/O) centralized rather than scattered inline across
  unrelated files.
- Any resource that needs cleanup (transactions, file handles, contexts,
  connections) should be closed/cancelled deterministically — don't leave that
  to the caller to remember.
- Don't add configuration fields, flags, or environment variables that nothing
  in the code actually reads — dead config is worse than no config.
- Prefer small, single-responsibility files over ever-growing "god files". If
  you're about to add the 15th unrelated function to one file, consider
  splitting first.
- Update relevant docs (`README`, `docs/*`, example config files) in the same
  change if you alter behavior they describe — don't let docs silently drift
  from reality.

---

## 4. Token-saving toolchain

This environment has tools installed specifically to reduce how many tokens an
agent burns per turn. **Use them.**

### 4.1 `rtk` — output-filtering CLI proxy

`rtk` (https://github.com/rtk-ai/rtk) wraps common CLI commands (`git`, `go
test`, `go build`, linters, `docker`, `kubectl`, etc.) and returns a compressed,
LLM-friendly summary instead of raw verbose output. Typical savings: 60–90% of
tokens for the same command.

Installed at `~/.local/bin/rtk` (already on `PATH` via `~/.bashrc`).

**How to use it:** prefix normal shell commands with `rtk`:

```bash
rtk go test ./...      # -> compressed one-line summary instead of full test output
rtk npm test
rtk git status
rtk git log -10
```

On failure, `rtk` still surfaces the full raw output (or a path to a saved log
under `~/.local/share/rtk/tee/`) so nothing important is silently hidden — it
only compresses the *successful/verbose* case.

**Do NOT re-install the automatic `PreToolUse` hook** (`rtk init -g --copilot`).
In this environment/version (rtk 0.43.0) that hook config
(`~/.copilot/hooks/rtk-rewrite.json`) was found to be malformed — it registered
both a `PreToolUse` and `preToolUse` key with an unsupported field shape and
caused **every single tool call to be denied** ("hook errored"), completely
freezing the agent. It was removed. Stick to manually prefixing commands with
`rtk` — no hook required, same savings, no risk of bricking the session. If a
future rtk release explicitly documents (and you've verified) correct GitHub
Copilot CLI hook support, it's fine to revisit — but test it in a disposable
session first, not the one you're actively working in.

Other useful `rtk` meta-commands:

```bash
rtk gain              # token savings dashboard for this machine
rtk gain --history     # per-command savings history
rtk discover           # find commands you ran raw that rtk could have compressed
```

### 4.2 CodeGraph — code knowledge graph (MCP server)

`CodeGraph` (`@colbymchenry/codegraph` on npm,
https://github.com/colbymchenry/codegraph) builds a local, queryable graph of
every symbol/call-edge/dependency in the repo, so an agent can answer
architecture questions in ~1 tool call instead of a grep/read crawl. 100% local
(SQLite-backed), no data leaves the machine, no API keys.

**Install** (once per machine):

```bash
curl -fsSL https://raw.githubusercontent.com/colbymchenry/codegraph/main/install.sh | sh
# or, if Node is available:
npm i -g @colbymchenry/codegraph
```

**Initialize this project** (once per checkout — builds `.codegraph/`, a local
index; safe to add to a `.gitignore` if/when this repo becomes a git repo):

```bash
cd <this-project-root>
codegraph init
```

Auto-sync is on by default — it watches the filesystem and keeps the graph
current as files change, no manual re-run needed.

**Wiring it into GitHub Copilot CLI:** CodeGraph's own installer
auto-configures Claude Code, Cursor, Codex CLI, opencode, Gemini CLI, and a few
others — it does **not** currently auto-detect GitHub Copilot CLI. To use it
here, wire it up manually as an MCP server using Copilot CLI's own MCP
management:

```
/mcp add
```

(inside an interactive Copilot CLI session), pointing it at the command
`codegraph serve --mcp` run from this project's root. Verify it's active with
`/mcp` (list) before relying on it, and confirm with a real architecture
question about this codebase that it returns graph results instead of falling
back to grep/read.

If CodeGraph isn't installed/wired yet in a given session, that's fine — fall
back to the built-in `grep`/`glob`/`view` tools as normal. Don't block on
installing it unless the user asks for it specifically.

### 4.3 General token-discipline rules

- Prefer `grep`/`glob` with narrow globs over broad directory dumps.
- Use `view_range` on any file you expect to be large — don't read a whole
  large file just to find one function.
- Batch independent reads/searches in one turn instead of one-at-a-time.
- Run build/test/lint commands through `rtk` by default (e.g. `rtk go build
  ./...`, `rtk npm run build`, `rtk cargo test`, `rtk pytest`) rather than raw.
- Don't `cat`/dump large binary or database files (e.g. `*.db`, `*.db-wal`,
  large log files) into context. Query them with the appropriate tool instead
  (e.g. `sqlite3 <file> "<query>"`, `jq` for large JSON, `tail -n N` for logs)
  and only pull the specific data you need.
