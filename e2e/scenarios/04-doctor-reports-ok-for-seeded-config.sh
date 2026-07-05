#!/bin/bash
# Scenario: `ctxrun doctor` reports "ok" for every seeded config file, proving
# plugin checks correctly resolve devuser's paths.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"

OUT=$(su devuser -c "sudo ctxrun doctor")

assert_contains "$OUT" "targetUser=devuser"
assert_contains "$OUT" "[ok] git.config"
assert_contains "$OUT" "[ok] gh.hosts"
assert_contains "$OUT" "[ok] aws.credentials"
assert_contains "$OUT" "[ok] aws.config"
assert_contains "$OUT" "[ok] kubectl.config"
assert_contains "$OUT" "[ok] docker.config"
assert_contains "$OUT" "[ok] gcloud.activeConfig"
assert_contains "$OUT" "[ok] python.pipConf"
assert_not_contains "$OUT" "[fail]"
