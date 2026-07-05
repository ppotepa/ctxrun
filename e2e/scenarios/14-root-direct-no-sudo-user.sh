#!/bin/bash
# Scenario: root runs ctxrun directly (no sudo, no SUDO_USER).
# In this case there is no "real user" to restore — root is the current and
# target user. ctxrun must reflect that and NOT try to resolve a non-existent
# sudo user's home.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"

# 1. doctor run directly as root (no SUDO_USER in env) shows root as target.
OUT=$(env -u SUDO_USER ctxrun doctor)
assert_contains "$OUT" "currentUser=root"
assert_contains "$OUT" "targetUser=root"
assert_contains "$OUT" "sudoUser=(none)"

# 2. dry-run as root resolves root's HOME.
DRY=$(env -u SUDO_USER ctxrun gh --dry-run)
assert_contains "$DRY" "HOME=/root"
assert_not_contains "$DRY" "HOME=/home/devuser"

# 3. explain as root shows root's config dirs.
EXPLAIN=$(env -u SUDO_USER ctxrun explain gh)
assert_contains "$EXPLAIN" "HOME=/root"

echo "Root direct run (no SUDO_USER): OK"
