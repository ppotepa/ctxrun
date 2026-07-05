#!/bin/bash
# Scenario: `ctxrun plugins list` enumerates every built-in plugin and preset,
# including composed (`extends`) presets with their fully merged plugin list.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"

OUT=$(su devuser -c "ctxrun plugins list")

assert_contains "$OUT" "codex - Points Codex at the target user's Codex home."
assert_contains "$OUT" "aws - Points AWS CLI at the target user's credentials and config files."
assert_contains "$OUT" "codex-aws -> codex (extends codex) [base, git, gh, ssh, codex, aws]"
assert_contains "$OUT" "codex-cloud -> codex (extends codex) [base, git, gh, ssh, codex, aws, gcloud, kubectl]"
