#!/bin/bash
# Scenario: `codex-aws` extends `codex`, so it must merge in AWS env vars
# while still keeping every plugin from the base `codex` preset.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"

OUT=$(su devuser -c "sudo ctxrun codex-aws --dry-run")

assert_contains "$OUT" "Preset: codex-aws"
assert_contains "$OUT" "CODEX_HOME=/home/devuser/.codex"
assert_contains "$OUT" "AWS_SHARED_CREDENTIALS_FILE=/home/devuser/.aws/credentials"
assert_contains "$OUT" "AWS_CONFIG_FILE=/home/devuser/.aws/config"
assert_contains "$OUT" "GIT_CONFIG_GLOBAL=/home/devuser/.gitconfig"

OUT_CLOUD=$(su devuser -c "sudo ctxrun codex-cloud --dry-run")
assert_contains "$OUT_CLOUD" "KUBECONFIG=/home/devuser/.kube/config"
assert_contains "$OUT_CLOUD" "CLOUDSDK_CONFIG=/home/devuser/.config/gcloud"
assert_contains "$OUT_CLOUD" "AWS_CONFIG_FILE=/home/devuser/.aws/config"
