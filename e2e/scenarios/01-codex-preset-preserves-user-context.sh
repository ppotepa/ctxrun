#!/bin/bash
# Scenario: `sudo ctxrun codex` must preserve devuser's HOME/Git/GitHub/Codex
# context, not root's, when devuser runs it through sudo.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"

OUT=$(su devuser -c "sudo ctxrun codex --dry-run")

assert_contains "$OUT" "HOME=/home/devuser"
assert_contains "$OUT" "USER=devuser"
assert_contains "$OUT" "GIT_CONFIG_GLOBAL=/home/devuser/.gitconfig"
assert_contains "$OUT" "GH_CONFIG_DIR=/home/devuser/.config/gh"
assert_contains "$OUT" "CODEX_HOME=/home/devuser/.codex"
assert_not_contains "$OUT" "HOME=/root"
