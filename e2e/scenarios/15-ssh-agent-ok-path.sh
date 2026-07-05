#!/bin/bash
# Scenario: SSH_AUTH_SOCK set and pointing to a real socket → doctor reports [ok].
# Previously only the [warn] path (no socket) was covered. This scenario
# verifies the [ok] path when an SSH agent socket is actually present.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"

SOCK_DIR=$(mktemp -d)
SOCK="$SOCK_DIR/agent.sock"
SOCAT_PID=""
trap "rm -rf '$SOCK_DIR'; [ -n \"$SOCAT_PID\" ] && kill $SOCAT_PID 2>/dev/null || true" EXIT

# Create a real UNIX socket using socat (installed in Dockerfile).
socat UNIX-LISTEN:"$SOCK",fork /dev/null &
SOCAT_PID=$!
# Give socat a moment to start listening.
sleep 0.3

# Verify the socket actually exists.
if [ ! -S "$SOCK" ]; then
  echo "SKIP: socat socket not available, test inconclusive"
  exit 0
fi

# 1. doctor with a real SSH_AUTH_SOCK pointing to an existing socket → [ok].
OUT=$(su devuser -c "SSH_AUTH_SOCK='$SOCK' sudo -E ctxrun doctor")
assert_contains "$OUT" "[ok] ssh.agent"
assert_not_contains "$OUT" "[warn] ssh.agent"

# 2. dry-run passes SSH_AUTH_SOCK through to child (use git preset which includes ssh plugin).
DRY=$(su devuser -c "SSH_AUTH_SOCK='$SOCK' sudo -E ctxrun git --dry-run")
assert_contains "$DRY" "SSH_AUTH_SOCK=$SOCK"

# 3. Without SSH_AUTH_SOCK → [warn] (baseline sanity check).
OUT_WARN=$(su devuser -c "sudo ctxrun doctor")
assert_contains "$OUT_WARN" "[warn] ssh.agent"

echo "SSH_AUTH_SOCK [ok] path: OK"
