#!/bin/bash
# Scenario: `ctxrun <preset>` shorthand must produce byte-identical output to
# the explicit `ctxrun run <preset>` form.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"

EXPLICIT=$(su devuser -c "sudo ctxrun run codex --dry-run")
SHORTHAND=$(su devuser -c "sudo ctxrun codex --dry-run")

assert_equal "$SHORTHAND" "$EXPLICIT"

# Reserved words must never be swallowed by the shorthand.
DOCTOR_OUT=$(su devuser -c "ctxrun doctor")
assert_contains "$DOCTOR_OUT" "Context:"
assert_contains "$DOCTOR_OUT" "Checks:"
