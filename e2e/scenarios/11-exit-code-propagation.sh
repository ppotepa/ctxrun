#!/bin/bash
# Scenario: ctxrun must transparently propagate the child's exit code.
# The invoking process must see exactly what the child exited with — no
# collapsing to 0 or 1, no swallowing of the real status.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"

# Child exits 0 → ctxrun exits 0.
su devuser -c "sudo ctxrun sh -c 'exit 0'"
assert_exit_code $? 0

# Child exits 1 → ctxrun exits 1.
set +e
su devuser -c "sudo ctxrun sh -c 'exit 1'"
assert_exit_code $? 1
set -e

# Child exits 42 → ctxrun exits 42 (non-standard code must be preserved).
set +e
su devuser -c "sudo ctxrun sh -c 'exit 42'"
assert_exit_code $? 42
set -e

# Successful command that writes to stdout must still exit 0.
OUT=$(su devuser -c "sudo ctxrun sh -c 'echo hello'")
assert_exit_code $? 0
assert_equal "$OUT" "hello"

echo "Exit code propagation: OK"
