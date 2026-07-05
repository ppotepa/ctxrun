#!/bin/bash
# Scenario: one preset per catalog domain must resolve correctly.
# Rather than testing every one of the 100+ catalog presets (scenario 07 does
# that in bulk), this scenario picks one representative from each catalog domain
# and makes domain-specific assertions about its environment variables —
# verifying the declarative catalog entries actually produce the expected env.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"

run_dry() {
  su devuser -c "sudo ctxrun $1 --dry-run"
}

# ── ai.ts ────────────────────────────────────────────────────────────────────
OUT=$(run_dry "gemini")
assert_contains "$OUT" "HOME=/home/devuser"
assert_matches "$OUT" "GEMINI.*(HOME|CONFIG|DIR)=/home/devuser"

OUT=$(run_dry "claude")
assert_matches "$OUT" "CLAUDE.*(CONFIG|DIR)=/home/devuser"

# ── vcs.ts ───────────────────────────────────────────────────────────────────
OUT=$(run_dry "gh")
assert_contains "$OUT" "GH_CONFIG_DIR=/home/devuser/.config/gh"

OUT=$(run_dry "git")
assert_contains "$OUT" "GIT_CONFIG_GLOBAL=/home/devuser/.gitconfig"

# ── languages.ts ─────────────────────────────────────────────────────────────
OUT=$(run_dry "npm")
assert_matches "$OUT" "npm_config_(cache|userconfig)=/home/devuser"

OUT=$(run_dry "cargo")
assert_matches "$OUT" "CARGO_HOME=/home/devuser"

OUT=$(run_dry "python")
assert_matches "$OUT" "(PIP_CONFIG_FILE|PYTHONUSERBASE)=/home/devuser"

# ── cloud.ts ─────────────────────────────────────────────────────────────────
OUT=$(run_dry "aws")
assert_contains "$OUT" "AWS_SHARED_CREDENTIALS_FILE=/home/devuser/.aws/credentials"
assert_contains "$OUT" "AWS_CONFIG_FILE=/home/devuser/.aws/config"

OUT=$(run_dry "gcloud")
assert_contains "$OUT" "CLOUDSDK_CONFIG=/home/devuser/.config/gcloud"

# ── containers.ts ────────────────────────────────────────────────────────────
OUT=$(run_dry "docker")
assert_matches "$OUT" "DOCKER_CONFIG=/home/devuser"

OUT=$(run_dry "kubectl")
assert_contains "$OUT" "KUBECONFIG=/home/devuser/.kube/config"

# ── databases.ts ─────────────────────────────────────────────────────────────
OUT=$(run_dry "psql")
assert_matches "$OUT" "(PGPASSFILE|PSQL_HISTORY)=/home/devuser"

# ── editors.ts ───────────────────────────────────────────────────────────────
OUT=$(run_dry "vim")
assert_matches "$OUT" "(VIMINIT|VIMDOTDIR|HOME).*devuser"

# ── secrets.ts ───────────────────────────────────────────────────────────────
OUT=$(run_dry "gpg")
assert_matches "$OUT" "GNUPGHOME=/home/devuser"

# ── misc.ts ──────────────────────────────────────────────────────────────────
# curl uses base only (HOME passthrough is sufficient)
OUT=$(run_dry "curl")
assert_contains "$OUT" "HOME=/home/devuser"

echo "Catalog domain coverage (one per domain): OK"
