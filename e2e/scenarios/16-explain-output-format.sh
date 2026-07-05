#!/bin/bash
# Scenario: `ctxrun explain <preset>` output must have a well-defined structure:
# Preset, Command, Plugins, and Environment sections, with correct values.
# This guards against accidental format regressions that would break scripts
# or documentation that parses the output.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"

# 1. explain codex — hand-written preset.
OUT=$(su devuser -c "sudo ctxrun explain codex")

assert_contains "$OUT" "Preset:"
assert_contains "$OUT" "codex"
assert_contains "$OUT" "Command:"
assert_contains "$OUT" "Plugins:"
assert_contains "$OUT" "Environment:"

# Values must be correct.
assert_contains "$OUT" "HOME=/home/devuser"
assert_contains "$OUT" "GIT_CONFIG_GLOBAL=/home/devuser/.gitconfig"
assert_contains "$OUT" "GH_CONFIG_DIR=/home/devuser/.config/gh"
assert_contains "$OUT" "CODEX_HOME=/home/devuser/.codex"
assert_not_contains "$OUT" "HOME=/root"

# Plugin list must appear.
assert_contains "$OUT" "base"
assert_contains "$OUT" "git"
assert_contains "$OUT" "gh"
assert_contains "$OUT" "ssh"

# 2. explain gh — simpler preset.
OUT_GH=$(su devuser -c "sudo ctxrun explain gh")
assert_contains "$OUT_GH" "GH_CONFIG_DIR=/home/devuser/.config/gh"
assert_not_contains "$OUT_GH" "CODEX_HOME"

# 3. explain and --dry-run must produce identical environment lines.
EXPLAIN_ENV=$(su devuser -c "sudo ctxrun explain codex" | grep "=")
DRY_ENV=$(su devuser -c "sudo ctxrun codex --dry-run" | grep "=")
assert_equal "$EXPLAIN_ENV" "$DRY_ENV"

echo "explain output format: OK"
