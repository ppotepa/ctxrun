#!/bin/bash
# Scenario: without sudo, devuser is not root, so ctxrun should reflect
# devuser as both current and target user (no SUDO_USER involved).
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"

OUT=$(su devuser -c "ctxrun explain gh")

assert_contains "$OUT" "GH_CONFIG_DIR=/home/devuser/.config/gh"
assert_contains "$OUT" "HOME=/home/devuser"

DOCTOR_OUT=$(su devuser -c "ctxrun doctor")
assert_contains "$DOCTOR_OUT" "currentUser=devuser"
assert_contains "$DOCTOR_OUT" "targetUser=devuser"
assert_contains "$DOCTOR_OUT" "sudoUser=(none)"
