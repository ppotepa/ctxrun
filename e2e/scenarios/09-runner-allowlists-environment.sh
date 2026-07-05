#!/bin/bash
# Scenario: a real (non dry-run) invocation must actually execute the target
# process with a *filtered* environment - PATH/TERM/LANG pass through so the
# tool behaves normally, but arbitrary ambient variables from the invoking
# shell must NOT leak into the child. Plugin-provided variables always win.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"

# git must actually run and see devuser's config through the real (non
# dry-run) path, proving the allowlist still lets PATH resolve the binary.
OUT=$(su devuser -c "sudo ctxrun git config --get user.name")
assert_equal "$OUT" "Dev User"

# An arbitrary, non-allowlisted variable set in the invoking shell must not
# reach the child process.
LEAK_OUT=$(su devuser -c "SHOULD_NOT_LEAK=secret sudo -E ctxrun run env")
assert_not_contains "$LEAK_OUT" "SHOULD_NOT_LEAK"
assert_contains "$LEAK_OUT" "HOME=/home/devuser"

# A command that does not exist must fail with a clear error, not a raw stack trace.
set +e
MISSING_OUT=$(su devuser -c "ctxrun run this-binary-does-not-exist-anywhere" 2>&1)
MISSING_STATUS=$?
set -e
if [ "$MISSING_STATUS" -eq 0 ]; then
  echo "ASSERTION FAILED: expected a non-zero exit status for a missing binary"
  exit 1
fi
assert_contains "$MISSING_OUT" "Command not found"
